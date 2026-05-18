import { db } from '@/lib/db';
import type { Order, HoursEntry, InvoiceScheduleItem } from '@prisma/client';
import type { OrderFormValues } from '@/lib/schemas/order';

// ─── Order total ──────────────────────────────────────────────────────────────

type OrderTotalInput = {
  hourlyRate: number;
  additionalOngoingCosts?: number | null;
  additionalOutcosts?: number | null;
  hoursEntries: Array<{
    hours?: number | null;
    setupHours?: number | null;
    monthlyHours?: number | null;
    months?: number | null;
  }>;
};

export function calculateOrderTotal(order: OrderTotalInput): number {
  const hoursValue = order.hoursEntries.reduce((sum, entry) => {
    const oneOff = (entry.hours ?? 0) + (entry.setupHours ?? 0);
    const recurring = (entry.monthlyHours ?? 0) * (entry.months ?? 1);
    return sum + (oneOff + recurring) * order.hourlyRate;
  }, 0);
  return (
    hoursValue +
    (order.additionalOngoingCosts ?? 0) +
    (order.additionalOutcosts ?? 0)
  );
}

// ─── Form → Prisma data builders ─────────────────────────────────────────────

export function buildScalarFields(v: OrderFormValues) {
  return {
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
    estimatedStartDate: v.estimatedStartDate
      ? new Date(v.estimatedStartDate)
      : null,
    estimatedEndDate: v.estimatedEndDate ? new Date(v.estimatedEndDate) : null,
  };
}

export function mapHoursEntries(entries: OrderFormValues['hoursEntries']) {
  return entries.map((e) => ({
    roleName: e.roleName,
    hours: e.hours,
    setupHours: e.setupHours,
    monthlyHours: e.monthlyHours,
    months: e.months,
  }));
}

export function mapInvoiceSchedule(
  schedule: OrderFormValues['invoiceSchedule'],
) {
  return schedule.map((i) => ({
    monthOffset: i.monthOffset,
    date: i.date ? new Date(i.date) : undefined,
    percentage: i.percentage,
  }));
}

export function buildOrderCreateData(v: OrderFormValues) {
  return {
    ...buildScalarFields(v),
    hoursEntries: { create: mapHoursEntries(v.hoursEntries) },
    invoiceSchedule: { create: mapInvoiceSchedule(v.invoiceSchedule) },
  };
}

export function buildOrderUpdateData(v: OrderFormValues) {
  return {
    ...buildScalarFields(v),
    isAmended: true,
    amendedAt: new Date(),
    hoursEntries: { deleteMany: {}, create: mapHoursEntries(v.hoursEntries) },
    invoiceSchedule: {
      deleteMany: {},
      create: mapInvoiceSchedule(v.invoiceSchedule),
    },
  };
}

export type FullOrder = Order & {
  hoursEntries: HoursEntry[];
  invoiceSchedule: InvoiceScheduleItem[];
};

export async function getOrder(id: string): Promise<FullOrder | null> {
  return db.order.findUnique({
    where: { id },
    include: {
      hoursEntries: true,
      invoiceSchedule: true,
    },
  });
}

export type OrderListItem = {
  id: string;
  companyName: string;
  projectName: string | null;
  salesperson: string;
  requirementType: string;
  totalValue: number;
  submittedAt: Date;
};

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
  };
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
  });

  return orders.map((order) => {
    const totalValue = calculateOrderTotal(order);

    return {
      id: order.id,
      companyName: order.companyName,
      projectName: order.projectName,
      salesperson: order.salesperson,
      requirementType: order.requirementType,
      totalValue,
      submittedAt: order.submittedAt,
    };
  });
}
