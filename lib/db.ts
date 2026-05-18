import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { db: PrismaClient }

function createClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.db ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db
}
