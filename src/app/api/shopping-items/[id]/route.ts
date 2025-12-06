import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const body = await request.json()

    const item = await prisma.shoppingItem.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updated = await prisma.shoppingItem.update({
      where: { id: params.id },
      data: body
    })

    // If item is marked as bought, create an expense automatically
    let expenseCreated = false
    if (body.isBought && body.actualPrice && !item.isBought) {
      try {
        const category = item.categoryId 
          ? await prisma.shoppingCategory.findUnique({ where: { id: item.categoryId } })
          : null

        const expenseData = {
          userId: decoded.userId,
          date: new Date(),
          title: `${updated.name} (Shopping)`,
          amount: Math.round(body.actualPrice * updated.quantity),
          category: 'Shopping',
          bank: 'Cash',
          paymentMode: 'Cash',
          tags: category ? [category.name, 'Shopping'] : ['Shopping'],
          notes: `Bought ${updated.quantity} ${updated.unit} at ₹${body.actualPrice} each${category ? ` from ${category.name}` : ''}`
        }

        console.log('Creating expense for shopping item:', expenseData)

        const expense = await prisma.expense.create({
          data: expenseData
        })

        console.log('Expense created successfully:', expense.id)
        expenseCreated = true
      } catch (expenseError) {
        console.error('Error creating expense for shopping item:', expenseError)
        // Don't fail the whole request if expense creation fails
      }
    }

    // Update category costs if item has a category
    if (item.categoryId) {
      const allItems = await prisma.shoppingItem.findMany({
        where: { categoryId: item.categoryId }
      })
      
      const totalExpected = allItems.reduce((sum, i) => sum + (i.expectedPrice * i.quantity), 0)
      const totalReal = allItems
        .filter(i => i.isBought && i.actualPrice)
        .reduce((sum, i) => sum + (i.actualPrice! * i.quantity), 0)
      
      await prisma.shoppingCategory.update({
        where: { id: item.categoryId },
        data: { 
          expectedCost: totalExpected,
          realCost: totalReal
        }
      })
    }

    return NextResponse.json({ ...updated, expenseCreated })
  } catch (error) {
    console.error('Error updating shopping item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const item = await prisma.shoppingItem.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const categoryId = item.categoryId

    await prisma.shoppingItem.delete({
      where: { id: params.id }
    })

    // Update category costs after deletion
    if (categoryId) {
      const allItems = await prisma.shoppingItem.findMany({
        where: { categoryId: categoryId }
      })
      
      const totalExpected = allItems.reduce((sum, i) => sum + (i.expectedPrice * i.quantity), 0)
      const totalReal = allItems
        .filter(i => i.isBought && i.actualPrice)
        .reduce((sum, i) => sum + (i.actualPrice! * i.quantity), 0)
      
      await prisma.shoppingCategory.update({
        where: { id: categoryId },
        data: { 
          expectedCost: totalExpected,
          realCost: totalReal
        }
      })
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting shopping item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
