import { Resend } from 'resend';
import { db } from '@/lib/db';
import { calculateOrderTotal } from '@/lib/orders';
import { formatCurrency, formatDate } from '@/lib/format';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildHtml(params: {
  orderId: string;
  displayId: number | null;
  companyName: string;
  projectName: string | null;
  salesperson: string;
  requirementType: string;
  totalValue: number;
  submittedAt: Date;
  isAmended: boolean;
  invoiceScheduleMode: string;
  invoiceSchedule: Array<{
    percentage: number;
    date: Date | null;
    monthOffset: number | null;
  }>;
  appUrl: string;
}): string {
  const {
    orderId,
    displayId,
    companyName,
    projectName,
    salesperson,
    requirementType,
    totalValue,
    submittedAt,
    isAmended,
    invoiceScheduleMode,
    invoiceSchedule,
    appUrl,
  } = params;
  const isDepositMode = invoiceScheduleMode === 'deposit';

  const displayRef = displayId != null ? `ID-${displayId}` : '—';

  const orderUrl = `${appUrl}/orders/${orderId}`;

  const scheduleRows = invoiceSchedule
    .map((item, idx) => {
      const when = isDepositMode
        ? 'Deposit'
        : item.date != null
          ? formatDate(item.date)
          : item.monthOffset != null
            ? `Month ${item.monthOffset}`
            : `Milestone ${idx + 1}`;
      const amount = formatCurrency((totalValue * item.percentage) / 100);
      return `
        <tr>
          <td style="padding:6px 10px;border:1px solid #ddd;">${when}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;">${item.percentage}%</td>
          <td style="padding:6px 10px;border:1px solid #ddd;">${amount}</td>
        </tr>`;
    })
    .join('');

  const heading = isAmended ? 'Amended Sales Order' : 'New Sales Order';

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
        <td style="padding:6px 10px;">${displayRef}</td>
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
      ${
        !isAmended
          ? `
      <tr>
        <th style="text-align:left;padding:6px 10px;background:#f5f5f5;">Submitted</th>
        <td style="padding:6px 10px;">${formatDate(submittedAt)}</td>
      </tr>`
          : ''
      }
    </tbody>
  </table>

  ${
    invoiceSchedule.length > 0
      ? `<h3 style="color:#2C73D7;">${isDepositMode ? 'Deposit' : 'Invoicing Schedule'}</h3>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr>
        <th style="padding:6px 10px;border:1px solid #ddd;background:#f5f5f5;text-align:left;">${isDepositMode ? 'Invoice' : 'Date / Month'}</th>
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
</html>`;
}

export async function sendFinanceEmail(
  orderId: string,
  isAmended: boolean,
): Promise<void> {
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      hoursEntries: true,
      invoiceSchedule: true,
    },
  });

  const totalValue = calculateOrderTotal(order);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  const clientLabel = `${order.companyName} / ${order.projectName ?? order.companyName}`;
  const idLabel = order.displayId != null ? ` [ID-${order.displayId}]` : '';
  const subject = isAmended
    ? `Amended Sales Order${idLabel} — ${clientLabel}`
    : `New Sales Order${idLabel} — ${clientLabel}`;

  const to = process.env.FINANCE_EMAIL_TO ?? 'luke.volpe@gmail.com';
  const cc = process.env.FINANCE_EMAIL_CC;

  const html = buildHtml({
    orderId,
    displayId: order.displayId,
    companyName: order.companyName,
    projectName: order.projectName,
    salesperson: order.salesperson,
    requirementType: order.requirementType,
    totalValue,
    submittedAt: order.submittedAt,
    isAmended,
    invoiceScheduleMode: order.invoiceScheduleMode,
    invoiceSchedule: order.invoiceSchedule,
    appUrl,
  });

  const { error } = await resend.emails.send({
    from: 'Ascensor Sales <onboarding@resend.dev>',
    to,
    ...(cc ? { cc } : {}),
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send finance email: ${error.message}`);
  }
}
