import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { storeSmartScore } from '@/lib/smartScore'

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const year = body.year || new Date().getFullYear()
  const month = body.month || new Date().getMonth() + 1

  const score = await storeSmartScore(userId, year, month)
  return NextResponse.json({ score })
}
