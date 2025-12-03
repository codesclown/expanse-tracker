import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  salary: z.number().optional().or(z.string().transform(val => val ? parseInt(val) : undefined)),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Register request body:', body)
    
    const data = registerSchema.parse(body)
    console.log('Parsed data:', data)

    // Check if database is available
    try {
      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }

      const passwordHash = await hashPassword(data.password)
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          salary: data.salary || 0,
        },
      })

      const token = signToken(user.id)
      return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      // If database is not available, return error with instructions
      return NextResponse.json({ 
        error: 'Database not configured. Please set up PostgreSQL or use local storage mode.',
        details: dbError.message 
      }, { status: 503 })
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ 
      error: error.message || 'Invalid request',
      details: error.issues || error.toString()
    }, { status: 400 })
  }
}
