import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

const createUdharSchema = z.object({
  person: z.string(),
  reason: z.string(),
  total: z.number().positive(),
  remaining: z.number().positive(),
  direction: z.enum(['given', 'taken']),
})

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const udhars = await prisma.udhar.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ udhars })
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createUdharSchema.parse(body)

    const udhar = await prisma.udhar.create({
      data: { ...data, userId },
    })

    return NextResponse.json({ udhar })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
