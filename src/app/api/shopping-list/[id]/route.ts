import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const body = await request.json()
    
    // Check if item exists and belongs to user
    const item = await prisma.shoppingList.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updatedItem = await prisma.shoppingList.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating shopping item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    // Check if item exists and belongs to user
    const item = await prisma.shoppingList.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await prisma.shoppingList.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting shopping item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}