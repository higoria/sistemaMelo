import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const columns = await prisma.column.findMany({
    include: {
      tasks: {
        where: { source: 'kanban' } as object,
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(columns)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await request.json()

  // Get max order
  const lastColumn = await prisma.column.findFirst({
    orderBy: { order: 'desc' },
  })

  const newOrder = (lastColumn?.order || 0) + 1000

  const column = await prisma.column.create({
    data: {
      title,
      order: newOrder,
    },
  })

  return NextResponse.json(column)
}
