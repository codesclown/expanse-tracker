import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

const createIncomeSchema = z.object({
  date: z.string().transform(s => new Date(s)),
  source: z.string(),
  amount: z.number().positive(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const incomes = await prisma.income.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ incomes })
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createIncomeSchema.parse(body)

    const income = await prisma.income.create({
      data: { ...data, userId },
    })

    return NextResponse.json({ income })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
