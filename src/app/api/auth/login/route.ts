import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Login request body:', body)
    
    const data = loginSchema.parse(body)

    try {
      const user = await prisma.user.findUnique({ where: { email: data.email } })
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const valid = await verifyPassword(data.password, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const token = signToken(user.id)
      return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Database not configured. Please use local storage mode or set up PostgreSQL.',
        details: dbError.message 
      }, { status: 503 })
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      error: error.message || 'Invalid request',
      details: error.toString()
    }, { status: 400 })
  }
}
