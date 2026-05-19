"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OrderListItem } from "@/lib/orders"

export function OrdersTable({ orders }: { orders: OrderListItem[] }) {
  const router = useRouter()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Salesperson</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <TableCell className="font-medium">
                <span>{order.companyName}</span>
                {order.isAmended && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                    Amended
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.projectName ?? "—"}
              </TableCell>
              <TableCell>{order.salesperson}</TableCell>
              <TableCell>{order.requirementType}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(order.totalValue)}
              </TableCell>
              <TableCell>
                <time
                  dateTime={order.submittedAt.toISOString()}
                  title={formatRelativeDate(new Date(order.submittedAt))}
                >
                  {formatDateTime(new Date(order.submittedAt))}
                </time>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
