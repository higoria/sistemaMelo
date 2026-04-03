import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items } = await request.json()

  // items = [{ id, columnId, order }, ...]
  const updates = items.map((item: { id: string; columnId: string; order: number }) =>
    prisma.task.update({
      where: { id: item.id },
      data: { columnId: item.columnId, order: item.order },
    })
  )

  await prisma.$transaction(updates)

  return NextResponse.json({ success: true })
}
