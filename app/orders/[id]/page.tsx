import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getOrder, calculateOrderTotal } from "@/lib/orders"
import type { FullOrder } from "@/lib/orders"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { SuccessBanner } from "@/components/success-banner"
import { CopyTsvButton } from "@/components/copy-tsv-button"
import { HoursDisplay } from "@/components/hours-display"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeNum(n: number | null | undefined) {
  return Number.isFinite(n) ? (n ?? 0) : 0
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-40 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  )
}

// ─── Invoice Schedule Table ───────────────────────────────────────────────────

function InvoiceScheduleTable({ order, total }: { order: FullOrder; total: number }) {
  const { invoiceSchedule } = order
  const isDepositMode = order.invoiceScheduleMode === 'deposit'
  if (invoiceSchedule.length === 0) return <p className="text-sm text-muted-foreground">No schedule set.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/60 text-left">
            <th className="px-3 py-2 font-medium">{isDepositMode ? 'Invoice' : 'Milestone'}</th>
            <th className="px-3 py-2 font-medium text-right">%</th>
            <th className="px-3 py-2 font-medium text-right">Cost</th>
          </tr>
        </thead>
        <tbody>
          {invoiceSchedule.map((item, idx) => (
            <tr key={item.id} className="border-t border-border">
              <td className="px-3 py-2">
                {isDepositMode
                  ? 'Deposit'
                  : item.date
                    ? new Date(item.date).toLocaleDateString("en-GB")
                    : item.monthOffset
                      ? `Month ${item.monthOffset}`
                      : `Milestone ${idx + 1}`}
              </td>
              <td className="px-3 py-2 text-right">{item.percentage}%</td>
              <td className="px-3 py-2 text-right">{formatCurrency((item.percentage / 100) * total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { success } = await searchParams

  const order = await getOrder(id)
  if (!order) notFound()

  const total = calculateOrderTotal(order)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      {success === "1" && (
        <SuccessBanner message="Order saved and finance notified." />
      )}
      {success === "amended" && (
        <SuccessBanner message="Order updated and finance notified." />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">
            {order.projectName ?? order.companyName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {order.companyName} &middot; {order.requirementType}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {order.displayId != null ? `ID-${order.displayId}` : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submitted {order.submittedAt.toLocaleString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {order.isAmended && (
              <span className="ml-2 text-brand font-medium">Amended</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyTsvButton order={order} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/orders/${id}/edit`}>Edit Order</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/orders">All Orders</Link>
          </Button>
        </div>
      </div>

      {/* Total callout */}
      <div className="rounded-xl bg-brand/10 border border-brand/20 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Total Order Value
        </p>
        <p className="text-3xl font-bold text-brand">{formatCurrency(total)}</p>
      </div>

      {/* Customer */}
      <SectionCard title="Customer">
        <Row label="Company" value={order.companyName} />
        <Row label="Contact" value={order.contactName} />
        <Row label="Email" value={order.email} />
        <Row label="Phone" value={order.phone} />
        <Row
          label="Customer type"
          value={order.isNewCustomer ? "New customer" : "Existing customer"}
        />
        {order.isNewCustomer && (
          <>
            <Row label="Address line 1" value={order.billingLine1} />
            <Row label="Address line 2" value={order.billingLine2} />
            <Row label="Town / city" value={order.billingTown} />
            <Row label="County" value={order.billingCounty} />
            <Row label="Postcode" value={order.billingPostcode} />
            <Row label="Country" value={order.billingCountry} />
          </>
        )}
      </SectionCard>

      {/* Account Contact */}
      <SectionCard title="Account Contact">
        {order.accountSameAsCustomer ? (
          <p className="text-sm text-muted-foreground">Same as customer contact</p>
        ) : (
          <>
            <Row label="Company" value={order.accountCompanyName} />
            <Row label="Contact" value={order.accountContactName} />
            <Row label="Email" value={order.accountEmail} />
          </>
        )}
      </SectionCard>

      {/* Sales Info */}
      <SectionCard title="Sales Info">
        <Row label="Salesperson" value={order.salesperson} />
        <Row label="Requirement type" value={order.requirementType} />
        <Row label="Sub-type" value={order.requirementSubType} />
      </SectionCard>

      {/* Hours */}
      <SectionCard title="Hours">
        <HoursDisplay
          requirementType={order.requirementType}
          hourlyRate={order.hourlyRate}
          entries={order.hoursEntries}
        />
      </SectionCard>

      {/* Rate & Costs */}
      <SectionCard title="Rate & Costs">
        <Row label="Hourly rate" value={`£${order.hourlyRate}/hr`} />
        {safeNum(order.additionalOngoingCosts) > 0 && (
          <Row label="Ongoing costs" value={formatCurrency(order.additionalOngoingCosts!)} />
        )}
        {safeNum(order.additionalOutcosts) > 0 && (
          <Row label="Outcosts" value={formatCurrency(order.additionalOutcosts!)} />
        )}
      </SectionCard>

      {/* Invoicing Schedule */}
      <SectionCard title="Invoicing Schedule">
        <InvoiceScheduleTable order={order} total={total} />
      </SectionCard>

      {/* Project Details */}
      <SectionCard title="Project Details">
        <Row label="Project name" value={order.projectName} />
        <Row label="Description" value={order.projectDescription} />
        <Row
          label="Start date"
          value={
            order.estimatedStartDate
              ? new Date(order.estimatedStartDate).toLocaleDateString("en-GB", { dateStyle: "long" })
              : null
          }
        />
        <Row
          label="End date"
          value={
            order.estimatedEndDate
              ? new Date(order.estimatedEndDate).toLocaleDateString("en-GB", { dateStyle: "long" })
              : null
          }
        />
      </SectionCard>
    </div>
  )
}
