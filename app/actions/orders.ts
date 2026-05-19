'use server';

import { db } from '@/lib/db';
import { orderFormSchema, type OrderFormValues } from '@/lib/schemas/order';
import {
  buildScalarFields,
  mapHoursEntries,
  mapInvoiceSchedule,
} from '@/lib/orders';
import { sendFinanceEmail } from '@/lib/email/sendFinanceEmail';

export async function updateOrder(
  id: string,
  data: OrderFormValues,
): Promise<{ id: string } | { error: string }> {
  const parsed = orderFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: 'Invalid form data. Please check your inputs and try again.',
    };
  }

  try {
    await db.order.update({
      where: { id },
      data: {
        ...buildScalarFields(parsed.data),
        isAmended: true,
        amendedAt: new Date(),
      },
    });

    // Replace related rows without using a transaction (some adapters don't support transactions)
    await db.hoursEntry.deleteMany({ where: { orderId: id } });
    const hours = mapHoursEntries(parsed.data.hoursEntries).map((h) => ({
      ...h,
      orderId: id,
    }));
    if (hours.length > 0) await db.hoursEntry.createMany({ data: hours });

    await db.invoiceScheduleItem.deleteMany({ where: { orderId: id } });
    const invoices = mapInvoiceSchedule(parsed.data.invoiceSchedule).map(
      (i) => ({
        ...i,
        orderId: id,
        date: i.date ?? null,
      }),
    );
    if (invoices.length > 0)
      await db.invoiceScheduleItem.createMany({ data: invoices });
  } catch (err) {
    console.error('updateOrder error:', err);
    return {
      error: 'Something went wrong updating the order. Please try again.',
    };
  }

  try {
    await sendFinanceEmail(id, true);
  } catch (err) {
    console.error('updateOrder: finance email failed (order was saved):', err);
  }

  return { id };
}

export async function createOrder(
  data: OrderFormValues,
): Promise<{ id: string } | { error: string }> {
  const parsed = orderFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: 'Invalid form data. Please check your inputs and try again.',
    };
  }

  let orderId: string;
  try {
    const maxResult = await db.order.aggregate({ _max: { displayId: true } });
    const nextDisplayId = Math.max(1013, (maxResult._max.displayId ?? 1012) + 1);

    // create order scalars first
    const order = await db.order.create({
      data: { ...buildScalarFields(parsed.data), displayId: nextDisplayId },
    });
    orderId = order.id;

    // then insert related rows separately to avoid transactions
    const hours = mapHoursEntries(parsed.data.hoursEntries).map((h) => ({
      ...h,
      orderId,
    }));
    if (hours.length > 0) await db.hoursEntry.createMany({ data: hours });

    const invoices = mapInvoiceSchedule(parsed.data.invoiceSchedule).map(
      (i) => ({
        ...i,
        orderId,
        date: i.date ?? null,
      }),
    );
    if (invoices.length > 0)
      await db.invoiceScheduleItem.createMany({ data: invoices });
  } catch (err) {
    console.error('createOrder error:', err);
    return {
      error: 'Something went wrong saving the order. Please try again.',
    };
  }

  try {
    await sendFinanceEmail(orderId, false);
  } catch (err) {
    console.error('createOrder: finance email failed (order was saved):', err);
  }

  return { id: orderId };
}
