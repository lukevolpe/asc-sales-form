'use client'

import * as React from 'react'
import { useWatch, type Control, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AIR_WEBSITE_PACKAGES, SINGLE_COLUMN_ROLES } from '@/lib/constants/airWebsitePackages'
import { formatCurrency } from '@/lib/format'
import type { OrderFormValues } from '@/lib/schemas/order'
import { cn } from '@/lib/utils'
import { computeDerivedHours, TESTING_ROLE, PM_ROLE } from '@/lib/orders'

function safeNum(n: number | undefined | null): number {
  return Number.isFinite(n) ? (n ?? 0) : 0
}

// Keeps local string state while typing; commits to the form store only on blur.
// The commit is deferred via setTimeout so Tab navigation completes before any
// re-render triggered by form.setValue, preventing focus disruption.
// Syncs from formValue prop when not focused (handles external updates like auto-calc).
function DeferredNumberInput({
  formValue,
  onCommit,
  className,
  min = 0,
  placeholder = '0',
}: {
  formValue: number | null | undefined
  onCommit: (value: number) => void
  className?: string
  min?: number
  placeholder?: string
}) {
  const [local, setLocal] = React.useState<string>(
    Number.isFinite(formValue) ? String(formValue) : ''
  )
  const isFocused = React.useRef(false)

  React.useEffect(() => {
    if (!isFocused.current) {
      setLocal(Number.isFinite(formValue) ? String(formValue) : '')
    }
  }, [formValue])

  return (
    <Input
      type="number"
      min={min}
      placeholder={placeholder}
      className={className}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onFocus={() => {
        isFocused.current = true
      }}
      onBlur={() => {
        isFocused.current = false
        const n = local === '' ? 0 : Number(local)
        const val = Number.isFinite(n) ? n : 0
        // Defer so the browser finishes moving focus before the form store
        // update triggers a re-render that could disrupt tab order.
        setTimeout(() => onCommit(val), 0)
      }}
    />
  )
}

function MatrixTotalRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-t border-border font-semibold bg-muted/40">
      <td className="px-3 py-2 text-sm">{label}</td>
      <td className="px-3 py-2 text-sm text-right" colSpan={99}>
        {value}
      </td>
    </tr>
  )
}

// These leaf components use useWatch so only they re-render when hours change,
// not the parent components that contain the inputs.

function SingleRowCost({
  control,
  idx,
  hourlyRate,
}: {
  control: Control<OrderFormValues>
  idx: number
  hourlyRate: number
}) {
  const hours = useWatch({ control, name: `hoursEntries.${idx}.hours` as `hoursEntries.0.hours` })
  return (
    <td className="px-3 py-2 text-right text-muted-foreground">
      {formatCurrency(safeNum(hours) * hourlyRate)}
    </td>
  )
}

function SingleMatrixTotal({
  control,
  hourlyRate,
}: {
  control: Control<OrderFormValues>
  hourlyRate: number
}) {
  const entries = useWatch({ control, name: 'hoursEntries' })
  const total = (entries ?? []).reduce((sum, e) => sum + safeNum(e?.hours) * hourlyRate, 0)
  return <MatrixTotalRow label="Total" value={formatCurrency(total)} />
}

function TwoColRowCost({
  control,
  idx,
  hourlyRate,
}: {
  control: Control<OrderFormValues>
  idx: number
  hourlyRate: number
}) {
  const setupHours = useWatch({
    control,
    name: `hoursEntries.${idx}.setupHours` as `hoursEntries.0.setupHours`,
  })
  const monthlyHours = useWatch({
    control,
    name: `hoursEntries.${idx}.monthlyHours` as `hoursEntries.0.monthlyHours`,
  })
  return (
    <td className="px-3 py-2 text-right text-muted-foreground">
      {formatCurrency((safeNum(setupHours) + safeNum(monthlyHours)) * hourlyRate)}
    </td>
  )
}

function TwoColMatrixTotal({
  control,
  hourlyRate,
}: {
  control: Control<OrderFormValues>
  hourlyRate: number
}) {
  const entries = useWatch({ control, name: 'hoursEntries' })
  const total = (entries ?? []).reduce(
    (sum, e) => sum + (safeNum(e?.setupHours) + safeNum(e?.monthlyHours)) * hourlyRate,
    0
  )
  return <MatrixTotalRow label="Total" value={formatCurrency(total)} />
}

function SingleColumnMatrix({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const entries = useWatch({ control: form.control, name: 'hoursEntries' }) ?? []
  const [manualOverrides, setManualOverrides] = React.useState<Set<string>>(() => new Set())
  const hourlyRate = safeNum(useWatch({ control: form.control, name: 'hourlyRate' }))

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const rawEntries = (values.hoursEntries ?? []) as Array<{
        roleName?: string
        hours?: number | null
      }>
      const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
        rawEntries,
        manualOverrides
      )

      if (!manualOverrides.has(TESTING_ROLE) && testingIdx >= 0) {
        const current = safeNum(rawEntries[testingIdx]?.hours)
        if (current !== derivedTesting) {
          form.setValue(`hoursEntries.${testingIdx}.hours`, derivedTesting, { shouldDirty: false })
        }
      }

      if (!manualOverrides.has(PM_ROLE) && pmIdx >= 0) {
        const current = safeNum(rawEntries[pmIdx]?.hours)
        if (current !== derivedPm) {
          form.setValue(`hoursEntries.${pmIdx}.hours`, derivedPm, { shouldDirty: false })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, manualOverrides])

  function resetDerived(roleName: string) {
    const next = new Set(manualOverrides)
    next.delete(roleName)
    setManualOverrides(next)
    const currentEntries = form.getValues('hoursEntries')
    const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
      currentEntries,
      next
    )
    if (roleName === TESTING_ROLE && testingIdx >= 0) {
      form.setValue(`hoursEntries.${testingIdx}.hours`, derivedTesting, { shouldDirty: false })
    }
    if (roleName === PM_ROLE && pmIdx >= 0) {
      form.setValue(`hoursEntries.${pmIdx}.hours`, derivedPm, { shouldDirty: false })
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/60 text-left">
            <th className="px-3 py-2 font-medium w-1/2">Role</th>
            <th className="px-3 py-2 font-medium">Hours</th>
            <th className="px-3 py-2 font-medium text-right">Cost</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const roleName = entry?.roleName ?? ''
            const isDerived = roleName === TESTING_ROLE || roleName === PM_ROLE
            const isOverridden = manualOverrides.has(roleName)

            return (
              <tr
                key={roleName}
                className={cn(
                  'border-t border-border',
                  isDerived && !isOverridden && 'bg-muted/20'
                )}
              >
                <td className="px-3 py-2">{roleName}</td>
                <td className="px-3 py-2">
                  {isDerived ? (
                    <div className="flex items-center gap-2">
                      <DeferredNumberInput
                        formValue={entry?.hours}
                        className={cn('h-11 w-24', !isOverridden && 'bg-muted/50')}
                        onCommit={(val) => {
                          if (!manualOverrides.has(roleName)) {
                            setManualOverrides((prev) => new Set(prev).add(roleName))
                          }
                          form.setValue(`hoursEntries.${idx}.hours`, val, { shouldDirty: true })
                        }}
                      />
                      {!isOverridden ? (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          auto
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resetDerived(roleName)}
                          className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap underline underline-offset-2"
                        >
                          ↩ auto
                        </button>
                      )}
                    </div>
                  ) : (
                    <DeferredNumberInput
                      formValue={entry?.hours}
                      className="h-11 w-24"
                      onCommit={(val) =>
                        form.setValue(`hoursEntries.${idx}.hours`, val, { shouldDirty: true })
                      }
                    />
                  )}
                </td>
                <SingleRowCost control={form.control} idx={idx} hourlyRate={hourlyRate} />
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <SingleMatrixTotal control={form.control} hourlyRate={hourlyRate} />
        </tfoot>
      </table>
    </div>
  )
}

function TwoColumnMatrix({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const entries = useWatch({ control: form.control, name: 'hoursEntries' }) ?? []
  const hourlyRate = safeNum(useWatch({ control: form.control, name: 'hourlyRate' }))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/60 text-left">
            <th className="px-3 py-2 font-medium w-2/5">Channel</th>
            <th className="px-3 py-2 font-medium">Setup Hrs</th>
            <th className="px-3 py-2 font-medium">Monthly Hrs</th>
            <th className="px-3 py-2 font-medium text-right">Cost</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={entry?.roleName ?? idx} className="border-t border-border">
              <td className="px-3 py-2">{entry?.roleName}</td>
              <td className="px-3 py-2">
                <DeferredNumberInput
                  formValue={entry?.setupHours}
                  className="h-11 w-24"
                  onCommit={(val) =>
                    form.setValue(`hoursEntries.${idx}.setupHours`, val, { shouldDirty: true })
                  }
                />
              </td>
              <td className="px-3 py-2">
                <DeferredNumberInput
                  formValue={entry?.monthlyHours}
                  className="h-11 w-24"
                  onCommit={(val) =>
                    form.setValue(`hoursEntries.${idx}.monthlyHours`, val, { shouldDirty: true })
                  }
                />
              </td>
              <TwoColRowCost control={form.control} idx={idx} hourlyRate={hourlyRate} />
            </tr>
          ))}
        </tbody>
        <tfoot>
          <TwoColMatrixTotal control={form.control} hourlyRate={hourlyRate} />
        </tfoot>
      </table>
    </div>
  )
}

function BauForm({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const entries = useWatch({ control: form.control, name: 'hoursEntries' })
  const studioHours = safeNum(entries?.[0]?.monthlyHours)
  const marketingHours = safeNum(entries?.[1]?.monthlyHours)
  const months = safeNum(entries?.[0]?.months) || 1
  const hourlyRate = safeNum(useWatch({ control: form.control, name: 'hourlyRate' }))
  const total = (studioHours + marketingHours) * months * hourlyRate

  function updateBau(newStudio: number, newMarketing: number, newMonths: number) {
    form.setValue('hoursEntries', [
      { roleName: 'Studio', monthlyHours: newStudio, months: newMonths },
      { roleName: 'Marketing', monthlyHours: newMarketing, months: newMonths },
    ])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Studio hours (per month)</Label>
          <DeferredNumberInput
            formValue={studioHours}
            onCommit={(val) => updateBau(val, marketingHours, months)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Marketing hours (per month)</Label>
          <DeferredNumberInput
            formValue={marketingHours}
            onCommit={(val) => updateBau(studioHours, val, months)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Number of months</Label>
          <DeferredNumberInput
            formValue={months}
            min={1}
            onCommit={(val) => updateBau(studioHours, marketingHours, Math.max(1, Math.round(val)))}
          />
        </div>
      </div>
      <p className="text-sm font-semibold">
        Total order value: <span className="text-brand">{formatCurrency(total)}</span>
      </p>
    </div>
  )
}

function AirWebsiteForm({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const entries = useWatch({ control: form.control, name: 'hoursEntries' }) ?? []
  const [selectedPackage, setSelectedPackage] = React.useState('')
  const [manualOverrides, setManualOverrides] = React.useState<Set<string>>(() => new Set())

  const hourlyRate = safeNum(useWatch({ control: form.control, name: 'hourlyRate' }))

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const rawEntries = (values.hoursEntries ?? []) as Array<{
        roleName?: string
        hours?: number | null
      }>
      const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
        rawEntries,
        manualOverrides
      )

      if (!manualOverrides.has(TESTING_ROLE) && testingIdx >= 0) {
        const current = safeNum(rawEntries[testingIdx]?.hours)
        if (current !== derivedTesting) {
          form.setValue(`hoursEntries.${testingIdx}.hours`, derivedTesting, {
            shouldDirty: false,
          })
        }
      }

      if (!manualOverrides.has(PM_ROLE) && pmIdx >= 0) {
        const current = safeNum(rawEntries[pmIdx]?.hours)
        if (current !== derivedPm) {
          form.setValue(`hoursEntries.${pmIdx}.hours`, derivedPm, { shouldDirty: false })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, manualOverrides])

  function applyPackage(packageName: string) {
    setSelectedPackage(packageName)
    setManualOverrides(new Set())
    const pkg = AIR_WEBSITE_PACKAGES[packageName]
    if (pkg) {
      form.setValue(
        'hoursEntries',
        SINGLE_COLUMN_ROLES.map((role) => ({ roleName: role, hours: pkg[role] }))
      )
    }
  }

  function resetDerived(roleName: string) {
    const next = new Set(manualOverrides)
    next.delete(roleName)
    setManualOverrides(next)
    const currentEntries = form.getValues('hoursEntries')
    const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
      currentEntries,
      next
    )
    if (roleName === TESTING_ROLE && testingIdx >= 0) {
      form.setValue(`hoursEntries.${testingIdx}.hours`, derivedTesting, { shouldDirty: false })
    }
    if (roleName === PM_ROLE && pmIdx >= 0) {
      form.setValue(`hoursEntries.${pmIdx}.hours`, derivedPm, { shouldDirty: false })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label>Package</Label>
        <Select value={selectedPackage || undefined} onValueChange={applyPackage}>
          <SelectTrigger className="h-11 w-full">
            <SelectValue placeholder="Select a package…" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(AIR_WEBSITE_PACKAGES).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-muted/60 text-left">
              <th className="px-3 py-2 font-medium w-1/2">Role</th>
              <th className="px-3 py-2 font-medium">Hours</th>
              <th className="px-3 py-2 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => {
              const roleName = entry?.roleName ?? ''
              const isDerived = roleName === TESTING_ROLE || roleName === PM_ROLE
              const isOverridden = manualOverrides.has(roleName)

              return (
                <tr
                  key={roleName}
                  className={cn(
                    'border-t border-border',
                    isDerived && !isOverridden && 'bg-muted/20'
                  )}
                >
                  <td className="px-3 py-2">{roleName}</td>
                  <td className="px-3 py-2">
                    {isDerived ? (
                      <div className="flex items-center gap-2">
                        <DeferredNumberInput
                          formValue={entry?.hours}
                          className={cn('h-11 w-24', !isOverridden && 'bg-muted/50')}
                          onCommit={(val) => {
                            if (!manualOverrides.has(roleName)) {
                              setManualOverrides((prev) => new Set(prev).add(roleName))
                            }
                            form.setValue(`hoursEntries.${idx}.hours`, val, { shouldDirty: true })
                          }}
                        />
                        {!isOverridden ? (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            auto
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => resetDerived(roleName)}
                            className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap underline underline-offset-2"
                          >
                            ↩ auto
                          </button>
                        )}
                      </div>
                    ) : (
                      <DeferredNumberInput
                        formValue={entry?.hours}
                        className="h-11 w-24"
                        onCommit={(val) =>
                          form.setValue(`hoursEntries.${idx}.hours`, val, { shouldDirty: true })
                        }
                      />
                    )}
                  </td>
                  <SingleRowCost control={form.control} idx={idx} hourlyRate={hourlyRate} />
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <SingleMatrixTotal control={form.control} hourlyRate={hourlyRate} />
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export function HoursMatrix({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const requirementType = useWatch({ control: form.control, name: 'requirementType' })

  switch (requirementType) {
    case 'Studio Project':
    case 'Advancement of Existing Website':
      return <SingleColumnMatrix form={form} />
    case 'Air Website':
      return <AirWebsiteForm form={form} />
    case 'Marketing Project':
    case 'B2B/B2C Lead Gen':
      return <TwoColumnMatrix form={form} />
    case 'BAU Retainer':
      return <BauForm form={form} />
    default:
      return (
        <p className="text-sm text-muted-foreground">
          Select a type of requirement in the previous step to configure the hours matrix.
        </p>
      )
  }
}
