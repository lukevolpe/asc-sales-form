import { formatCurrency } from '@/lib/format'

function safeNum(n: number | undefined | null): number {
  return Number.isFinite(n) ? (n ?? 0) : 0
}

export type HoursDisplayEntry = {
  roleName: string
  hours?: number | null
  setupHours?: number | null
  monthlyHours?: number | null
  months?: number | null
}

function DisplayRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-40 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  )
}

export function HoursDisplay({
  requirementType,
  hourlyRate,
  entries,
}: {
  requirementType: string
  hourlyRate: number
  entries: HoursDisplayEntry[]
}) {
  if (requirementType === 'BAU Retainer') {
    const studio = entries[0]
    const marketing = entries[1]
    const months = safeNum(studio?.months) || 1
    const total =
      (safeNum(studio?.monthlyHours) + safeNum(marketing?.monthlyHours)) * months * hourlyRate
    return (
      <div className="flex flex-col gap-2">
        <DisplayRow label="Studio hrs/month" value={String(safeNum(studio?.monthlyHours))} />
        <DisplayRow label="Marketing hrs/month" value={String(safeNum(marketing?.monthlyHours))} />
        <DisplayRow label="Months" value={String(months)} />
        <DisplayRow label="Hours total value" value={formatCurrency(total)} />
      </div>
    )
  }

  const isTwoCol =
    requirementType === 'Marketing Project' || requirementType === 'B2B/B2C Lead Gen'

  const grandTotal = entries.reduce((sum, e) => {
    const cost = isTwoCol
      ? (safeNum(e.setupHours) + safeNum(e.monthlyHours)) * hourlyRate
      : safeNum(e.hours) * hourlyRate
    return sum + cost
  }, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/60 text-left">
            <th className="px-3 py-2 font-medium w-2/5">{isTwoCol ? 'Channel' : 'Role'}</th>
            {isTwoCol ? (
              <>
                <th className="px-3 py-2 font-medium">Setup Hrs</th>
                <th className="px-3 py-2 font-medium">Monthly Hrs</th>
              </>
            ) : (
              <th className="px-3 py-2 font-medium">Hours</th>
            )}
            <th className="px-3 py-2 font-medium text-right">Cost</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => {
            const cost = isTwoCol
              ? (safeNum(e.setupHours) + safeNum(e.monthlyHours)) * hourlyRate
              : safeNum(e.hours) * hourlyRate
            return (
              <tr key={e.roleName ?? idx} className="border-t border-border">
                <td className="px-3 py-2">{e.roleName}</td>
                {isTwoCol ? (
                  <>
                    <td className="px-3 py-2">{safeNum(e.setupHours)}</td>
                    <td className="px-3 py-2">{safeNum(e.monthlyHours)}</td>
                  </>
                ) : (
                  <td className="px-3 py-2">{safeNum(e.hours)}</td>
                )}
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {formatCurrency(cost)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/40 font-medium">
            <td className="px-3 py-2" colSpan={isTwoCol ? 3 : 2}>
              Total
            </td>
            <td className="px-3 py-2 text-right">{formatCurrency(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
