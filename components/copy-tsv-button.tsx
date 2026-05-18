"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import type { FullOrder } from "@/lib/orders"

function buildTsvRow(order: FullOrder): string {
  // Placeholder column mapping — verify against live Google Sheet before release
  const hoursTotal = order.hoursEntries.reduce((sum, e) => {
    const h = (e.hours ?? 0) + (e.setupHours ?? 0) + (e.monthlyHours ?? 0) * (e.months ?? 1)
    return sum + h * order.hourlyRate
  }, 0)
  const total =
    hoursTotal + (order.additionalOngoingCosts ?? 0) + (order.additionalOutcosts ?? 0)

  const cols = [
    order.submittedAt.toLocaleDateString("en-GB"),
    order.companyName,
    order.contactName,
    order.email,
    order.phone,
    order.isNewCustomer ? "New" : "Existing",
    order.salesperson,
    order.requirementType,
    order.requirementSubType ?? "",
    order.projectName ?? "",
    order.projectDescription ?? "",
    order.estimatedStartDate?.toLocaleDateString("en-GB") ?? "",
    order.estimatedEndDate?.toLocaleDateString("en-GB") ?? "",
    String(order.hourlyRate),
    String(order.additionalOngoingCosts ?? 0),
    String(order.additionalOutcosts ?? 0),
    total.toFixed(2),
  ]

  return cols.join("\t")
}

export function CopyTsvButton({ order }: { order: FullOrder }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    const tsv = buildTsvRow(order)
    await navigator.clipboard.writeText(tsv)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy to Clipboard"}
    </Button>
  )
}
