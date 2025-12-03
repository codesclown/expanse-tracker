import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { parseUserQuery, resolveIntent } from '@/lib/chatbot'

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { query } = await req.json()
  const parsed = parseUserQuery(query)
  const response = await resolveIntent(userId, parsed)

  return NextResponse.json(response)
}
