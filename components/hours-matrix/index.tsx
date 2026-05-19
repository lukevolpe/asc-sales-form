'use client'

import * as React from 'react'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AIR_WEBSITE_PACKAGES, SINGLE_COLUMN_ROLES } from '@/lib/constants/airWebsitePackages'
import { formatCurrency } from '@/lib/format'
import type { OrderFormValues } from '@/lib/schemas/order'
import { cn } from '@/lib/utils'
import { computeDerivedHours, TESTING_ROLE, PM_ROLE } from '@/lib/orders'

function safeNum(n: number | undefined | null): number {
  return Number.isFinite(n) ? (n ?? 0) : 0
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

function SingleColumnMatrix({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const { fields } = useFieldArray({ control: form.control, name: 'hoursEntries' })
  const [manualOverrides, setManualOverrides] = React.useState<Set<string>>(new Set())
  const manualOverridesRef = React.useRef(manualOverrides)
  const hourlyRate = safeNum(form.watch('hourlyRate'))
  const entries = form.watch('hoursEntries')
  const total = entries.reduce((sum, e) => sum + safeNum(e.hours) * hourlyRate, 0)

  React.useEffect(() => {
    manualOverridesRef.current = manualOverrides
  }, [manualOverrides])

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const rawEntries = (values.hoursEntries ?? []) as Array<{
        roleName?: string
        hours?: number | null
      }>
      const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
        rawEntries,
        manualOverridesRef.current
      )

      if (!manualOverridesRef.current.has(TESTING_ROLE) && testingIdx >= 0) {
        const current = safeNum(rawEntries[testingIdx]?.hours)
        if (current !== derivedTesting) {
          form.setValue(`hoursEntries.${testingIdx}.hours`, derivedTesting, { shouldDirty: false })
        }
      }

      if (!manualOverridesRef.current.has(PM_ROLE) && pmIdx >= 0) {
        const current = safeNum(rawEntries[pmIdx]?.hours)
        if (current !== derivedPm) {
          form.setValue(`hoursEntries.${pmIdx}.hours`, derivedPm, { shouldDirty: false })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  function resetDerived(roleName: string) {
    setManualOverrides((prev) => {
      const next = new Set(prev)
      next.delete(roleName)
      manualOverridesRef.current = next
      return next
    })
    const currentEntries = form.getValues('hoursEntries')
    const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
      currentEntries,
      manualOverridesRef.current
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
          {fields.map((field, idx) => {
            const roleName = field.roleName
            const isDerived = roleName === TESTING_ROLE || roleName === PM_ROLE
            const isOverridden = manualOverrides.has(roleName)
            const hrs = safeNum(entries[idx]?.hours)

            const registerProps = form.register(`hoursEntries.${idx}.hours`, {
              valueAsNumber: true,
            })

            return (
              <tr
                key={field.id}
                className={cn(
                  'border-t border-border',
                  isDerived && !isOverridden && 'bg-muted/20'
                )}
              >
                <td className="px-3 py-2">{roleName}</td>
                <td className="px-3 py-2">
                  {isDerived ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        className={cn('h-11 w-24', !isOverridden && 'bg-muted/50')}
                        {...registerProps}
                        onChange={(e) => {
                          registerProps.onChange(e)
                          setManualOverrides((prev) => {
                            const next = new Set([...prev, roleName])
                            manualOverridesRef.current = next
                            return next
                          })
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
                    <Input
                      type="number"
                      min={0}
                      className="h-11 w-24"
                      {...registerProps}
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {formatCurrency(hrs * hourlyRate)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <MatrixTotalRow label="Total" value={formatCurrency(total)} />
        </tfoot>
      </table>
    </div>
  )
}

function TwoColumnMatrix({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const { fields } = useFieldArray({ control: form.control, name: 'hoursEntries' })
  const hourlyRate = safeNum(form.watch('hourlyRate'))
  const entries = form.watch('hoursEntries')
  const total = entries.reduce(
    (sum, e) => sum + (safeNum(e.setupHours) + safeNum(e.monthlyHours)) * hourlyRate,
    0
  )

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
          {fields.map((field, idx) => {
            const rowCost =
              (safeNum(entries[idx]?.setupHours) + safeNum(entries[idx]?.monthlyHours)) * hourlyRate
            return (
              <tr key={field.id} className="border-t border-border">
                <td className="px-3 py-2">{field.roleName}</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={0}
                    className="h-11 w-24"
                    {...form.register(`hoursEntries.${idx}.setupHours`, { valueAsNumber: true })}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={0}
                    className="h-11 w-24"
                    {...form.register(`hoursEntries.${idx}.monthlyHours`, { valueAsNumber: true })}
                  />
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {formatCurrency(rowCost)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <MatrixTotalRow label="Total" value={formatCurrency(total)} />
        </tfoot>
      </table>
    </div>
  )
}

function BauForm({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const entries = form.watch('hoursEntries')
  const studioHours = safeNum(entries[0]?.monthlyHours)
  const marketingHours = safeNum(entries[1]?.monthlyHours)
  const months = safeNum(entries[0]?.months) || 1
  const hourlyRate = safeNum(form.watch('hourlyRate'))
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
          <Input
            type="number"
            min={0}
            value={studioHours || ''}
            onChange={(e) =>
              updateBau(e.target.value === '' ? 0 : Number(e.target.value), marketingHours, months)
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Marketing hours (per month)</Label>
          <Input
            type="number"
            min={0}
            value={marketingHours || ''}
            onChange={(e) =>
              updateBau(studioHours, e.target.value === '' ? 0 : Number(e.target.value), months)
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Number of months</Label>
          <Input
            type="number"
            min={1}
            value={months}
            onChange={(e) =>
              updateBau(
                studioHours,
                marketingHours,
                e.target.value === '' ? 1 : Math.max(1, Math.round(Number(e.target.value)))
              )
            }
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
  const { fields } = useFieldArray({ control: form.control, name: 'hoursEntries' })
  const [selectedPackage, setSelectedPackage] = React.useState('')
  const [manualOverrides, setManualOverrides] = React.useState<Set<string>>(new Set())
  const manualOverridesRef = React.useRef(manualOverrides)

  const hourlyRate = safeNum(form.watch('hourlyRate'))
  const entries = form.watch('hoursEntries')
  const total = entries.reduce((sum, e) => sum + safeNum(e.hours) * hourlyRate, 0)

  // Keep ref in sync so the subscription closure always sees the latest overrides
  React.useEffect(() => {
    manualOverridesRef.current = manualOverrides
  }, [manualOverrides])

  // Subscription-based derived calculation — fires on every form value change,
  // bypassing render-cycle timing issues with uncontrolled form.register inputs.
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      const rawEntries = (values.hoursEntries ?? []) as Array<{
        roleName?: string
        hours?: number | null
      }>
      const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
        rawEntries,
        manualOverridesRef.current
      )

      if (!manualOverridesRef.current.has(TESTING_ROLE) && testingIdx >= 0) {
        const current = safeNum(rawEntries[testingIdx]?.hours)
        if (current !== derivedTesting) {
          form.setValue(`hoursEntries.${testingIdx}.hours`, derivedTesting, {
            shouldDirty: false,
          })
        }
      }

      if (!manualOverridesRef.current.has(PM_ROLE) && pmIdx >= 0) {
        const current = safeNum(rawEntries[pmIdx]?.hours)
        if (current !== derivedPm) {
          form.setValue(`hoursEntries.${pmIdx}.hours`, derivedPm, { shouldDirty: false })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  function applyPackage(packageName: string) {
    setSelectedPackage(packageName)
    setManualOverrides(new Set())
    manualOverridesRef.current = new Set()
    const pkg = AIR_WEBSITE_PACKAGES[packageName]
    if (pkg) {
      form.setValue(
        'hoursEntries',
        SINGLE_COLUMN_ROLES.map((role) => ({ roleName: role, hours: pkg[role] }))
      )
    }
  }

  function resetDerived(roleName: string) {
    setManualOverrides((prev) => {
      const next = new Set(prev)
      next.delete(roleName)
      manualOverridesRef.current = next
      return next
    })
    // Trigger subscription to recompute now that override is cleared
    const entries = form.getValues('hoursEntries')
    const { testingIdx, pmIdx, derivedTesting, derivedPm } = computeDerivedHours(
      entries,
      manualOverridesRef.current
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
        <select
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedPackage}
          onChange={(e) => applyPackage(e.target.value)}
        >
          <option value="">Select a package…</option>
          {Object.keys(AIR_WEBSITE_PACKAGES).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
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
            {fields.map((field, idx) => {
              const roleName = field.roleName
              const isDerived = roleName === TESTING_ROLE || roleName === PM_ROLE
              const isOverridden = manualOverrides.has(roleName)
              const hrs = safeNum(entries[idx]?.hours)

              // For derived rows: spread register props but intercept onChange to track overrides.
              // form.register is still used so the value is always included in form.getValues().
              const registerProps = form.register(`hoursEntries.${idx}.hours`, {
                valueAsNumber: true,
              })

              return (
                <tr
                  key={field.id}
                  className={cn(
                    'border-t border-border',
                    isDerived && !isOverridden && 'bg-muted/20'
                  )}
                >
                  <td className="px-3 py-2">{roleName}</td>
                  <td className="px-3 py-2">
                    {isDerived ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          className={cn('h-11 w-24', !isOverridden && 'bg-muted/50')}
                          {...registerProps}
                          onChange={(e) => {
                            registerProps.onChange(e)
                            setManualOverrides((prev) => {
                              const next = new Set([...prev, roleName])
                              manualOverridesRef.current = next
                              return next
                            })
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
                      <Input
                        type="number"
                        min={0}
                        className="h-11 w-24"
                        {...registerProps}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {formatCurrency(hrs * hourlyRate)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <MatrixTotalRow label="Total" value={formatCurrency(total)} />
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export function HoursMatrix({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const requirementType = form.watch('requirementType')

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
