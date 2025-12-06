import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const expenses = await prisma.expensePlanning.findMany({
      where: { userId: decoded.userId },
      include: {
        category: true
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expense planning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const body = await request.json()

    const { title, amount, categoryId, date, description } = body

    if (!title || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate date against category constraints
    if (categoryId) {
      const category = await prisma.planningCategory.findUnique({
        where: { id: categoryId }
      })

      if (category) {
        const expenseDate = new Date(date)
        const now = new Date()
        
        // Check if category has expired
        if (category.expiryDate && new Date(category.expiryDate) < now) {
          // Auto-update category to inactive
          await prisma.planningCategory.update({
            where: { id: categoryId },
            data: { isActive: false }
          })
          return NextResponse.json({ error: 'This category has expired and is no longer active' }, { status: 400 })
        }
        
        // Check if category is active
        if (!category.isActive) {
          return NextResponse.json({ error: 'This category is inactive. Cannot add expenses.' }, { status: 400 })
        }

        // Validate based on category type
        if (category.type === 'day' && category.startDate) {
          const categoryDay = new Date(category.startDate)
          categoryDay.setHours(0, 0, 0, 0)
          const expenseDay = new Date(expenseDate)
          expenseDay.setHours(0, 0, 0, 0)
          
          if (expenseDay.getTime() !== categoryDay.getTime()) {
            return NextResponse.json({ 
              error: `Expense date must be ${categoryDay.toLocaleDateString()} for this day category` 
            }, { status: 400 })
          }
        }

        if (category.type === 'month' && category.startDate) {
          const categoryDate = new Date(category.startDate)
          if (expenseDate.getMonth() !== categoryDate.getMonth() || 
              expenseDate.getFullYear() !== categoryDate.getFullYear()) {
            return NextResponse.json({ 
              error: `Expense must be in ${categoryDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` 
            }, { status: 400 })
          }
        }

        if (category.type === 'year' && category.startDate) {
          const categoryYear = new Date(category.startDate).getFullYear()
          if (expenseDate.getFullYear() !== categoryYear) {
            return NextResponse.json({ 
              error: `Expense must be in year ${categoryYear}` 
            }, { status: 400 })
          }
        }

        if (category.type === 'duration' && category.startDate && category.endDate) {
          const start = new Date(category.startDate)
          const end = new Date(category.endDate)
          if (expenseDate < start || expenseDate > end) {
            return NextResponse.json({ 
              error: `Expense date must be between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}` 
            }, { status: 400 })
          }
        }
      }
    }

    const expense = await prisma.expensePlanning.create({
      data: {
        title,
        amount: parseFloat(amount),
        categoryId: categoryId || null,
        date: new Date(date),
        description,
        userId: decoded.userId
      },
      include: {
        category: true
      }
    })

    // Update category real cost - sum of all expense amounts in the category
    if (categoryId) {
      const category = await prisma.planningCategory.findUnique({
        where: { id: categoryId },
        include: { expenses: true }
      })
      
      if (category) {
        // Calculate total real cost from all expenses (including the newly created one)
        const allExpenses = await prisma.expensePlanning.findMany({
          where: { categoryId: categoryId }
        })
        const totalRealCost = allExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        
        await prisma.planningCategory.update({
          where: { id: categoryId },
          data: { realCost: totalRealCost }
        })
      }
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense planning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}