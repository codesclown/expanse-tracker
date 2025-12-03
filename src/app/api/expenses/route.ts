import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { buildPrismaWhere } from '@/lib/filters'
import { linkExpenseToSubscription } from '@/lib/subscriptions'

const createExpenseSchema = z.object({
  date: z.string().transform(s => new Date(s)),
  title: z.string(),
  amount: z.number().positive(),
  category: z.string(),
  bank: z.string(),
  paymentMode: z.string(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filters = {
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    category: searchParams.get('category') || undefined,
    bank: searchParams.get('bank') || undefined,
  }

  const where = buildPrismaWhere(userId, filters)
  const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } })

  return NextResponse.json({ expenses })
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createExpenseSchema.parse(body)

    const expense = await prisma.expense.create({
      data: { ...data, userId },
    })

    await linkExpenseToSubscription(expense.id)

    return NextResponse.json({ expense })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
