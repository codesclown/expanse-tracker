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

    const { title, amount, category, date, description } = body

    if (!title || !amount || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const expense = await prisma.expensePlanning.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description,
        userId: decoded.userId
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense planning:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}