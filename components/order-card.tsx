"use client"

import Link from "next/link"
import type { OrderListItem } from "@/lib/orders"
import { formatCurrency, formatDateTime } from "@/lib/format"

export function OrderCard({ order }: { order: OrderListItem }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border p-4 hover:bg-muted/40 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold truncate">{order.companyName}</span>
        {order.isAmended && (
          <span className="shrink-0 inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            Amended
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground truncate">{order.projectName}</p>
      <p className="text-sm text-muted-foreground">
        {order.salesperson} · {order.requirementType}
      </p>
      <div className="flex items-center justify-between gap-2 mt-1">
        <time
          dateTime={order.submittedAt.toISOString()}
          className="text-xs text-muted-foreground"
        >
          {formatDateTime(new Date(order.submittedAt))}
        </time>
        <span className="font-semibold tabular-nums text-sm">
          {formatCurrency(order.totalValue)}
        </span>
      </div>
    </Link>
  )
}
