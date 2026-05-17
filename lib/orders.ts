import { db } from '@/lib/db'

export type OrderListItem = {
  id: string
  companyName: string
  projectName: string | null
  salesperson: string
  requirementType: string
  totalValue: number
  submittedAt: Date
}

export async function listOrders(query?: string): Promise<OrderListItem[]> {
  const orders = await db.order.findMany({
    where: query
      ? {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { projectName: { contains: query, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      hoursEntries: true,
    },
    orderBy: { submittedAt: 'desc' },
  })

  return orders.map((order) => {
    const hoursTotal = order.hoursEntries.reduce((sum, entry) => {
      const h =
        (entry.hours ?? 0) +
        (entry.setupHours ?? 0) +
        (entry.monthlyHours ?? 0) * (entry.months ?? 1)
      return sum + h * order.hourlyRate
    }, 0)

    const totalValue =
      hoursTotal +
      (order.additionalOngoingCosts ?? 0) +
      (order.additionalOutcosts ?? 0)

    return {
      id: order.id,
      companyName: order.companyName,
      projectName: order.projectName,
      salesperson: order.salesperson,
      requirementType: order.requirementType,
      totalValue,
      submittedAt: order.submittedAt,
    }
  })
}
