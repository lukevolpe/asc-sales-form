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
    await db.order.update({ where: { id }, data: buildOrderUpdateData(parsed.data) })
  } catch (err) {
    console.error('updateOrder error:', err)
    return { error: 'Something went wrong updating the order. Please try again.' }
  }

  try {
    await sendFinanceEmail(id, true)
  } catch (err) {
    console.error('updateOrder: finance email failed (order was saved):', err)
  }

  return { id }
}

export async function createOrder(
  data: OrderFormValues
): Promise<{ id: string } | { error: string }> {
  const parsed = orderFormSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid form data. Please check your inputs and try again.' }
  }

  let orderId: string
  try {
    const order = await db.order.create({ data: buildOrderCreateData(parsed.data) })
    orderId = order.id
  } catch (err) {
    console.error('createOrder error:', err)
    return { error: 'Something went wrong saving the order. Please try again.' }
  }

  try {
    await sendFinanceEmail(orderId, false)
  } catch (err) {
    console.error('createOrder: finance email failed (order was saved):', err)
  }

  return { id: orderId }
}
