'use server'

import { db } from '@/lib/db'
import { orderFormSchema, type OrderFormValues } from '@/lib/schemas/order'
import { buildOrderCreateData, buildOrderUpdateData } from '@/lib/orders'
import { sendFinanceEmail } from '@/lib/email/sendFinanceEmail'

export async function updateOrder(
  id: string,
  data: OrderFormValues
): Promise<{ id: string } | { error: string }> {
  const parsed = orderFormSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid form data. Please check your inputs and try again.' }
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: buildOrderUpdateData(parsed.data) })
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

  try {
    const order = await db.$transaction(async (tx) => {
      return tx.order.create({ data: buildOrderCreateData(parsed.data) })
    })

    await sendFinanceEmail(order.id, false)

    return { id: order.id }
  } catch (err) {
    console.error('createOrder error:', err)
    return { error: 'Something went wrong saving the order. Please try again.' }
  }
}
