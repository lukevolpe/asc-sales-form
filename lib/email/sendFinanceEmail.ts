import { Resend } from 'resend'
import { db } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function calculateTotalValue(order: {
  hourlyRate: number
  additionalOngoingCosts: number | null
  additionalOutcosts: number | null
  hoursEntries: Array<{
    hours: number | null
    setupHours: number | null
    monthlyHours: number | null
    months: number | null
  }>
}): number {
  const hoursValue = order.hoursEntries.reduce((sum, entry) => {
    const oneOff = (entry.hours ?? 0) + (entry.setupHours ?? 0)
    const recurring = (entry.monthlyHours ?? 0) * (entry.months ?? 0)
    return sum + (oneOff + recurring) * order.hourlyRate
  }, 0)
  return hoursValue + (order.additionalOngoingCosts ?? 0) + (order.additionalOutcosts ?? 0)
}

function buildHtml(params: {
  orderId: string
  companyName: string
  projectName: string | null
  salesperson: string
  requirementType: string
  totalValue: number
  submittedAt: Date
  isAmended: boolean
  invoiceSchedule: Array<{
    percentage: number
    date: Date | null
    monthOffset: number | null
  }>
  appUrl: string
}): string {
  const {
    orderId,
    companyName,
    projectName,
    salesperson,
    requirementType,
    totalValue,
    submittedAt,
    isAmended,
    invoiceSchedule,
    appUrl,
  } = params

  const orderUrl = `${appUrl}/orders/${orderId}`

  const scheduleRows = invoiceSchedule
    .map((item) => {
      const when =
        item.date != null
          ? formatDate(item.date)
          : item.monthOffset != null
            ? `Month ${item.monthOffset}`
            : '—'
      const amount = formatCurrency((totalValue * item.percentage) / 100)
      return `
        <tr>
          <td style="padding:6px 10px;border:1px solid #ddd;">${when}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;">${item.percentage}%</td>
          <td style="padding:6px 10px;border:1px solid #ddd;">${amount}</td>
        </tr>`
    })
    .join('')

  const heading = isAmended ? 'Amended Sales Order' : 'New Sales Order'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${heading}</title>
</head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:620px;margin:0 auto;padding:24px;">
  <h2 style="color:#2C73D7;margin-top:0;">${heading}</h2>
  ${isAmended ? `<p style="color:#666;font-size:14px;">Originally submitted: ${formatDate(submittedAt)}</p>` : ''}
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tbody>
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;width:40%;">Order Reference</th>
        <td style="padding:6px 10px;">${orderId}</td>
      </tr>
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;">Client</th>
        <td style="padding:6px 10px;">${companyName}</td>
      </tr>
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;">Project</th>
        <td style="padding:6px 10px;">${projectName ?? '—'}</td>
      </tr>
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;">Salesperson</th>
        <td style="padding:6px 10px;">${salesperson}</td>
      </tr>
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;">Requirement Type</th>
        <td style="padding:6px 10px;">${requirementType}</td>
      </tr>
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;">Total Value</th>
        <td style="padding:6px 10px;font-weight:bold;">${formatCurrency(totalValue)}</td>
      </tr>
      ${!isAmended ? `
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;">Submitted</th>
        <td style="padding:6px 10px;">${formatDate(submittedAt)}</td>
      </tr>` : ''}
    </tbody>
  </table>

  ${
    invoiceSchedule.length > 0
      ? `<h3 style="color:#2C73D7;">Invoicing Schedule</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr>
        <th style="padding:6px 10px;border:1px solid #ddd;background:#f5f5f5;text-align:left;">Date / Month</th>
        <th style="padding:6px 10px;border:1px solid #ddd;background:#f5f5f5;text-align:left;">%</th>
        <th style="padding:6px 10px;border:1px solid #ddd;background:#f5f5f5;text-align:left;">Amount</th>
      </tr>
    </thead>
    <tbody>${scheduleRows}</tbody>
  </table>`
      : ''
  }

  <p>
    <a href="${orderUrl}" style="color:#2C73D7;text-decoration:none;font-weight:bold;">
      View order in Ascensor Sales &rarr;
    </a>
  </p>
</body>
</html>`
}

export async function sendFinanceEmail(orderId: string, isAmended: boolean): Promise<void> {
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      hoursEntries: true,
      invoiceSchedule: true,
    },
  })

  const totalValue = calculateTotalValue(order)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const clientLabel = `${order.companyName} / ${order.projectName ?? order.companyName}`
  const subject = isAmended
    ? `Amended Sales Order — ${clientLabel}`
    : `New Sales Order — ${clientLabel}`

  const to = process.env.FINANCE_EMAIL_TO ?? 'finance@ascensor.co.uk'
  const cc = process.env.FINANCE_EMAIL_CC

  const html = buildHtml({
    orderId,
    companyName: order.companyName,
    projectName: order.projectName,
    salesperson: order.salesperson,
    requirementType: order.requirementType,
    totalValue,
    submittedAt: order.submittedAt,
    isAmended,
    invoiceSchedule: order.invoiceSchedule,
    appUrl,
  })

  const { error } = await resend.emails.send({
    from: 'Ascensor Sales <noreply@ascensor.co.uk>',
    to,
    ...(cc ? { cc } : {}),
    subject,
    html,
  })

  if (error) {
    throw new Error(`Failed to send finance email: ${error.message}`)
  }
}
