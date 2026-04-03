import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('senha123', 10)

  // Array of 4 initial users
  const users = [
    { name: 'Usuário 1', email: 'user1@example.com', passwordHash },
    { name: 'Usuário 2', email: 'user2@example.com', passwordHash },
    { name: 'Usuário 3', email: 'user3@example.com', passwordHash },
    { name: 'Usuário 4', email: 'user4@example.com', passwordHash },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  // Create initial columns if none exist
  const columnCount = await prisma.column.count()
  if (columnCount === 0) {
    const defaultColumns = [
      { title: 'To Do', order: 1000 },
      { title: 'In Progress', order: 2000 },
      { title: 'Done', order: 3000 },
    ]

    for (const col of defaultColumns) {
      await prisma.column.create({
        data: col
      })
    }
  }

  console.log('Seed executed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
