import { db } from '@/lib/db'
import type { Order, HoursEntry, InvoiceScheduleItem } from '@prisma/client'
import type { OrderFormValues } from '@/lib/schemas/order'

export type FullOrder = Order & {
  hoursEntries: HoursEntry[]
  invoiceSchedule: InvoiceScheduleItem[]
}

export async function getOrder(id: string): Promise<FullOrder | null> {
  return db.order.findUnique({
    where: { id },
    include: {
      hoursEntries: true,
      invoiceSchedule: true,
    },
  })
}

export type OrderListItem = {
  id: string
  companyName: string
  projectName: string | null
  salesperson: string
  requirementType: string
  totalValue: number
  submittedAt: Date
}

export function orderToFormValues(order: FullOrder): OrderFormValues {
  return {
    companyName: order.companyName,
    contactName: order.contactName,
    email: order.email,
    phone: order.phone,
    isNewCustomer: order.isNewCustomer,
    billingLine1: order.billingLine1 ?? '',
    billingLine2: order.billingLine2 ?? '',
    billingTown: order.billingTown ?? '',
    billingCounty: order.billingCounty ?? '',
    billingPostcode: order.billingPostcode ?? '',
    billingCountry: order.billingCountry ?? '',
    accountSameAsCustomer: order.accountSameAsCustomer,
    accountCompanyName: order.accountCompanyName ?? '',
    accountContactName: order.accountContactName ?? '',
    accountEmail: order.accountEmail ?? '',
    salesperson: order.salesperson,
    requirementType: order.requirementType,
    requirementSubType: order.requirementSubType ?? '',
    hoursEntries: order.hoursEntries.map((e) => ({
      roleName: e.roleName,
      hours: e.hours ?? undefined,
      setupHours: e.setupHours ?? undefined,
      monthlyHours: e.monthlyHours ?? undefined,
      months: e.months ?? undefined,
    })),
    hourlyRate: order.hourlyRate,
    additionalOngoingCosts: order.additionalOngoingCosts ?? undefined,
    additionalOutcosts: order.additionalOutcosts ?? undefined,
    invoiceSchedule: order.invoiceSchedule.map((i) => ({
      monthOffset: i.monthOffset ?? undefined,
      date: i.date ? i.date.toISOString().split('T')[0] : undefined,
      percentage: i.percentage,
    })),
    projectName: order.projectName ?? '',
    projectDescription: order.projectDescription ?? '',
    estimatedStartDate: order.estimatedStartDate
      ? order.estimatedStartDate.toISOString().split('T')[0]
      : '',
    estimatedEndDate: order.estimatedEndDate
      ? order.estimatedEndDate.toISOString().split('T')[0]
      : '',
  }
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
