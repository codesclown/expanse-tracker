import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { detectSubscriptions } from '@/lib/subscriptions'

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscriptions = await detectSubscriptions(userId)
  return NextResponse.json({ subscriptions, count: subscriptions.length })
}
