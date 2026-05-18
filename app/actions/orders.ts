'use server'

import { db } from '@/lib/db'
import { orderFormSchema, type OrderFormValues } from '@/lib/schemas/order'
import { sendFinanceEmail } from '@/lib/email/sendFinanceEmail'

export async function updateOrder(
  id: string,
  data: OrderFormValues
): Promise<{ id: string } | { error: string }> {
  const parsed = orderFormSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid form data. Please check your inputs and try again.' }
  }

  const v = parsed.data

  try {
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          companyName: v.companyName,
          contactName: v.contactName,
          email: v.email,
          phone: v.phone,
          isNewCustomer: v.isNewCustomer,
          billingLine1: v.billingLine1 || null,
          billingLine2: v.billingLine2 || null,
          billingTown: v.billingTown || null,
          billingCounty: v.billingCounty || null,
          billingPostcode: v.billingPostcode || null,
          billingCountry: v.billingCountry || null,
          accountSameAsCustomer: v.accountSameAsCustomer,
          accountCompanyName: v.accountCompanyName || null,
          accountContactName: v.accountContactName || null,
          accountEmail: v.accountEmail || null,
          salesperson: v.salesperson!,
          requirementType: v.requirementType!,
          requirementSubType: v.requirementSubType || null,
          hourlyRate: v.hourlyRate,
          additionalOngoingCosts: v.additionalOngoingCosts,
          additionalOutcosts: v.additionalOutcosts,
          projectName: v.projectName || null,
          projectDescription: v.projectDescription || null,
          estimatedStartDate: v.estimatedStartDate ? new Date(v.estimatedStartDate) : null,
          estimatedEndDate: v.estimatedEndDate ? new Date(v.estimatedEndDate) : null,
          isAmended: true,
          amendedAt: new Date(),
          hoursEntries: {
            deleteMany: {},
            create: v.hoursEntries.map((e) => ({
              roleName: e.roleName,
              hours: e.hours,
              setupHours: e.setupHours,
              monthlyHours: e.monthlyHours,
              months: e.months,
            })),
          },
          invoiceSchedule: {
            deleteMany: {},
            create: v.invoiceSchedule.map((i) => ({
              monthOffset: i.monthOffset,
              date: i.date ? new Date(i.date) : undefined,
              percentage: i.percentage,
            })),
          },
        },
      })
    })

    await sendFinanceEmail(id, true)

    return { id }
  } catch (err) {
    console.error('updateOrder error:', err)
    return { error: 'Something went wrong updating the order. Please try again.' }
  }
}

export async function createOrder(
  data: OrderFormValues
): Promise<{ id: string } | { error: string }> {
  const parsed = orderFormSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid form data. Please check your inputs and try again.' }
  }

  const v = parsed.data

  try {
    const order = await db.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          companyName: v.companyName,
          contactName: v.contactName,
          email: v.email,
          phone: v.phone,
          isNewCustomer: v.isNewCustomer,
          billingLine1: v.billingLine1 || undefined,
          billingLine2: v.billingLine2 || undefined,
          billingTown: v.billingTown || undefined,
          billingCounty: v.billingCounty || undefined,
          billingPostcode: v.billingPostcode || undefined,
          billingCountry: v.billingCountry || undefined,
          accountSameAsCustomer: v.accountSameAsCustomer,
          accountCompanyName: v.accountCompanyName || undefined,
          accountContactName: v.accountContactName || undefined,
          accountEmail: v.accountEmail || undefined,
          salesperson: v.salesperson!,
          requirementType: v.requirementType!,
          requirementSubType: v.requirementSubType || undefined,
          hourlyRate: v.hourlyRate,
          additionalOngoingCosts: v.additionalOngoingCosts,
          additionalOutcosts: v.additionalOutcosts,
          projectName: v.projectName || undefined,
          projectDescription: v.projectDescription || undefined,
          estimatedStartDate: v.estimatedStartDate
            ? new Date(v.estimatedStartDate)
            : undefined,
          estimatedEndDate: v.estimatedEndDate
            ? new Date(v.estimatedEndDate)
            : undefined,
          hoursEntries: {
            create: v.hoursEntries.map((e) => ({
              roleName: e.roleName,
              hours: e.hours,
              setupHours: e.setupHours,
              monthlyHours: e.monthlyHours,
              months: e.months,
            })),
          },
          invoiceSchedule: {
            create: v.invoiceSchedule.map((i) => ({
              monthOffset: i.monthOffset,
              date: i.date ? new Date(i.date) : undefined,
              percentage: i.percentage,
            })),
          },
        },
      })
    })

    await sendFinanceEmail(order.id, false)

    return { id: order.id }
  } catch (err) {
    console.error('createOrder error:', err)
    return { error: 'Something went wrong saving the order. Please try again.' }
  }
}
