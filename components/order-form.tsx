"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { StepIndicator, type FormStep } from "@/components/step-indicator"
import { Button } from "@/components/ui/button"
import { CardSelect } from "@/components/ui/card-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { orderFormSchema, type OrderFormValues } from "@/lib/schemas/order"
import { SALESPEOPLE } from "@/lib/constants/salespeople"
import {
  REQUIREMENT_TYPES,
  REQUIREMENT_SUB_TYPES,
  SUB_TYPE_REQUIRED_FOR,
  getDefaultHoursEntries,
} from "@/lib/constants/requirementTypes"
import { calculateOrderTotal } from "@/lib/orders"
import { formatCurrency } from "@/lib/format"
import { HoursMatrix } from "@/components/hours-matrix"
import { HoursDisplay } from "@/components/hours-display"
import { updateOrder } from "@/app/actions/orders"
import type { FullOrder } from "@/lib/orders"
import { orderToFormValues } from "@/lib/orders"

// ─── Step IDs ───────────────────────────────────────────────────────────────

const STEP_CUSTOMER = "customer"
const STEP_BILLING = "billing"
const STEP_ACCOUNT_CONTACT = "account-contact"
const STEP_SALES_INFO = "sales-info"
const STEP_HOURS = "hours"
const STEP_RATE = "rate"
const STEP_PROJECT = "project"
const STEP_CONFIRM = "confirm"

const ALL_STEPS = [
  { id: STEP_CUSTOMER, label: "Customer" },
  { id: STEP_BILLING, label: "Billing Address" },
  { id: STEP_ACCOUNT_CONTACT, label: "Account Contact" },
  { id: STEP_SALES_INFO, label: "Sales Info" },
  { id: STEP_HOURS, label: "Hours" },
  { id: STEP_RATE, label: "Rate & Schedule" },
  { id: STEP_PROJECT, label: "Project Details" },
  { id: STEP_CONFIRM, label: "Confirm" },
] as const

// ─── Default values for a new order ─────────────────────────────────────────

export const NEW_ORDER_DEFAULTS: OrderFormValues = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  isNewCustomer: false,
  billingLine1: "",
  billingLine2: "",
  billingTown: "",
  billingCounty: "",
  billingPostcode: "",
  billingCountry: "",
  accountSameAsCustomer: true,
  accountCompanyName: "",
  accountContactName: "",
  accountEmail: "",
  salesperson: "",
  requirementType: "",
  requirementSubType: "",
  hoursEntries: [],
  hourlyRate: 110,
  additionalOngoingCosts: undefined,
  additionalOutcosts: undefined,
  invoiceSchedule: [],
  projectName: "",
  projectDescription: "",
  estimatedStartDate: "",
  estimatedEndDate: "",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeNum(n: number | undefined | null): number {
  return Number.isFinite(n) ? (n ?? 0) : 0
}

// ─── Shared field components ─────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive mt-1">{message}</p>
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  )
}


function NativeSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-11 w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

// ─── Step 1: Customer Information ────────────────────────────────────────────

function CustomerInfoStep({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form
  const isNewCustomer = watch("isNewCustomer")

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company name" required error={errors.companyName?.message}>
          <Input
            {...register("companyName")}
            placeholder="Acme Ltd"
            aria-invalid={!!errors.companyName}
          />
        </Field>
        <Field label="Contact name" required error={errors.contactName?.message}>
          <Input
            {...register("contactName")}
            placeholder="Jane Smith"
            aria-invalid={!!errors.contactName}
          />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            {...register("email")}
            placeholder="jane@example.com"
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field label="Phone" required error={errors.phone?.message}>
          <Input
            type="tel"
            {...register("phone")}
            placeholder="+44 7700 900000"
            aria-invalid={!!errors.phone}
          />
        </Field>
      </div>

      <CardSelect
        legend="Customer type"
        name="isNewCustomer"
        value={isNewCustomer ? "new" : "existing"}
        onChange={(v) => setValue("isNewCustomer", v === "new")}
        options={[
          { label: "Existing customer", value: "existing" },
          { label: "New customer", value: "new" },
        ]}
      />
    </div>
  )
}

// ─── Step 2: New Customer Details ────────────────────────────────────────────

function NewCustomerDetailsStep({
  form,
}: {
  form: UseFormReturn<OrderFormValues>
}) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="flex flex-col gap-4">
      <Field label="Address line 1" required error={errors.billingLine1?.message}>
        <Input
          {...register("billingLine1")}
          placeholder="123 Main Street"
          aria-invalid={!!errors.billingLine1}
        />
      </Field>
      <Field label="Address line 2" error={errors.billingLine2?.message}>
        <Input {...register("billingLine2")} placeholder="Suite 4" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Town / city" required error={errors.billingTown?.message}>
          <Input
            {...register("billingTown")}
            placeholder="Leeds"
            aria-invalid={!!errors.billingTown}
          />
        </Field>
        <Field label="County" error={errors.billingCounty?.message}>
          <Input {...register("billingCounty")} placeholder="West Yorkshire" />
        </Field>
        <Field label="Postcode" required error={errors.billingPostcode?.message}>
          <Input
            {...register("billingPostcode")}
            placeholder="LS1 4DY"
            aria-invalid={!!errors.billingPostcode}
          />
        </Field>
        <Field label="Country" required error={errors.billingCountry?.message}>
          <Input
            {...register("billingCountry")}
            placeholder="United Kingdom"
            aria-invalid={!!errors.billingCountry}
          />
        </Field>
      </div>
    </div>
  )
}

// ─── Step 3: Account Contact ─────────────────────────────────────────────────

function AccountContactStep({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form
  const accountSameAsCustomer = watch("accountSameAsCustomer")

  return (
    <div className="flex flex-col gap-6">
      <CardSelect
        legend="Accounts contact"
        name="accountSameAsCustomer"
        value={accountSameAsCustomer ? "same" : "different"}
        onChange={(v) => setValue("accountSameAsCustomer", v === "same")}
        options={[
          { label: "Same as customer contact", value: "same" },
          { label: "Different contact", value: "different" },
        ]}
      />

      {!accountSameAsCustomer && (
        <div className="flex flex-col gap-4">
          <Field
            label="Account company name"
            required
            error={errors.accountCompanyName?.message}
          >
            <Input
              {...register("accountCompanyName")}
              placeholder="Acme Finance Ltd"
              aria-invalid={!!errors.accountCompanyName}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Contact name"
              required
              error={errors.accountContactName?.message}
            >
              <Input
                {...register("accountContactName")}
                placeholder="John Finance"
                aria-invalid={!!errors.accountContactName}
              />
            </Field>
            <Field label="Email" required error={errors.accountEmail?.message}>
              <Input
                type="email"
                {...register("accountEmail")}
                placeholder="accounts@acme.com"
                aria-invalid={!!errors.accountEmail}
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 4: Sales Information ────────────────────────────────────────────────

function SalesInfoStep({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form

  const requirementType = watch("requirementType")
  const requirementSubType = watch("requirementSubType")
  const showSubType = SUB_TYPE_REQUIRED_FOR.includes(requirementType ?? "")

  function handleTypeChange(newType: string) {
    setValue("requirementType", newType)
    if (!SUB_TYPE_REQUIRED_FOR.includes(newType)) {
      setValue("requirementSubType", "")
    }
    setValue("hoursEntries", getDefaultHoursEntries(newType))
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Salesperson" required error={errors.salesperson?.message}>
        <Controller
          control={form.control}
          name="salesperson"
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger
                className="h-11 w-full"
                aria-invalid={!!errors.salesperson}
              >
                <SelectValue placeholder="Select salesperson…" />
              </SelectTrigger>
              <SelectContent>
                {SALESPEOPLE.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <CardSelect
          legend="Type of requirement *"
          name="requirementType"
          value={requirementType ?? ""}
          onChange={handleTypeChange}
          cols={3}
          options={REQUIREMENT_TYPES.map((t) => ({ label: t, value: t }))}
        />
        {errors.requirementType && (
          <FieldError message={errors.requirementType.message} />
        )}
      </div>

      {showSubType && (
        <div className="flex flex-col gap-1.5">
          <CardSelect
            legend="Sub-type *"
            name="requirementSubType"
            value={requirementSubType ?? ""}
            onChange={(v) => setValue("requirementSubType", v)}
            options={REQUIREMENT_SUB_TYPES.map((s) => ({ label: s, value: s }))}
          />
          {errors.requirementSubType && (
            <FieldError message={errors.requirementSubType.message} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Step 5: Hours ───────────────────────────────────────────────────────────

function HoursStep({ form }: { form: UseFormReturn<OrderFormValues> }) {
  return <HoursMatrix form={form} />
}

// ─── Step 6: Rate, Invoicing Schedule & Additional Costs ─────────────────────

function RateStep({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form
  const { fields, append, remove } = useFieldArray({ control, name: "invoiceSchedule" })
  const [rowModes, setRowModes] = React.useState<Record<string, "month" | "date">>({})

  const schedule = watch("invoiceSchedule")
  const total = schedule.reduce((sum, item) => sum + (item.percentage || 0), 0)
  const totalRounded = Math.round(total)

  // Infer mode from pre-populated data when no override exists in rowModes
  const getMode = (fieldId: string, index: number): "month" | "date" => {
    if (fieldId in rowModes) return rowModes[fieldId]
    return schedule[index]?.date ? "date" : "month"
  }

  const setMode = (fieldId: string, mode: "month" | "date", index: number) => {
    if (mode === "month") {
      setValue(`invoiceSchedule.${index}.date`, undefined)
    } else {
      setValue(`invoiceSchedule.${index}.monthOffset`, undefined)
    }
    setRowModes((prev) => ({ ...prev, [fieldId]: mode }))
  }

  const addMilestone = () => {
    append({ percentage: undefined as unknown as number })
  }

  const removeRow = (index: number, fieldId: string) => {
    remove(index)
    setRowModes((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }

  const scheduleRootError =
    errors.invoiceSchedule && !Array.isArray(errors.invoiceSchedule)
      ? (errors.invoiceSchedule as { message?: string }).message
      : (errors.invoiceSchedule as { root?: { message?: string } } | undefined)?.root?.message

  return (
    <div className="flex flex-col gap-6">
      <Field label="Hourly Rate (£/hr)" required error={errors.hourlyRate?.message}>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground select-none">
            £
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register("hourlyRate", { valueAsNumber: true })}
            className="pl-7"
            aria-invalid={!!errors.hourlyRate}
          />
        </div>
      </Field>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Invoicing Schedule</Label>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              totalRounded === 100 ? "text-green-600" : "text-destructive"
            )}
          >
            {totalRounded}% / 100%
          </span>
        </div>

        {scheduleRootError && (
          <p className="text-xs text-destructive">{scheduleRootError}</p>
        )}

        {fields.map((field, index) => {
          const mode = getMode(field.id, index)
          const rowErrors = Array.isArray(errors.invoiceSchedule)
            ? errors.invoiceSchedule[index]
            : undefined
          return (
            <div
              key={field.id}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-4 self-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    className="accent-brand"
                    checked={mode === "month"}
                    onChange={() => setMode(field.id, "month", index)}
                  />
                  Month #
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    className="accent-brand"
                    checked={mode === "date"}
                    onChange={() => setMode(field.id, "date", index)}
                  />
                  Exact date
                </label>
              </div>

              {mode === "month" ? (
                <Field label="Month no." error={rowErrors?.monthOffset?.message}>
                  <Input
                    type="number"
                    min="1"
                    {...register(`invoiceSchedule.${index}.monthOffset`, {
                      valueAsNumber: true,
                    })}
                    className="w-24"
                    placeholder="e.g. 3"
                  />
                </Field>
              ) : (
                <Field label="Date" error={rowErrors?.date?.message}>
                  <Input
                    type="date"
                    {...register(`invoiceSchedule.${index}.date`)}
                    className="w-40"
                  />
                </Field>
              )}

              <Field label="%" required error={rowErrors?.percentage?.message}>
                <div className="relative flex items-center">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register(`invoiceSchedule.${index}.percentage`, {
                      valueAsNumber: true,
                    })}
                    className="w-24 pr-6"
                    placeholder="25"
                  />
                  <span className="pointer-events-none absolute right-2 text-sm text-muted-foreground select-none">
                    %
                  </span>
                </div>
              </Field>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="self-end"
                onClick={() => removeRow(index, field.id)}
                aria-label="Remove milestone"
              >
                ✕
              </Button>
            </div>
          )
        })}

        <Button type="button" variant="outline" onClick={addMilestone}>
          Add Milestone
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Additional Ongoing Costs (£)"
          error={errors.additionalOngoingCosts?.message}
        >
          <Input
            type="number"
            min="0"
            step="0.01"
            {...register("additionalOngoingCosts", {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
            })}
            placeholder="0"
          />
        </Field>
        <Field label="Additional Outcosts (£)" error={errors.additionalOutcosts?.message}>
          <Input
            type="number"
            min="0"
            step="0.01"
            {...register("additionalOutcosts", {
              setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
            })}
            placeholder="0"
          />
        </Field>
      </div>
    </div>
  )
}

// ─── Step 7: Project Details ──────────────────────────────────────────────────

function ProjectDetailsStep({ form }: { form: UseFormReturn<OrderFormValues> }) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="flex flex-col gap-4">
      <Field label="Project name / summary" error={errors.projectName?.message}>
        <Input
          {...register("projectName")}
          placeholder="Website redesign"
        />
      </Field>
      <Field label="Description of requirements" error={errors.projectDescription?.message}>
        <textarea
          {...register("projectDescription")}
          rows={4}
          placeholder="Describe the project requirements…"
          className={cn(
            "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none resize-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Estimated start date" error={errors.estimatedStartDate?.message}>
          <Input type="date" {...register("estimatedStartDate")} />
        </Field>
        <Field label="Estimated end date" error={errors.estimatedEndDate?.message}>
          <Input type="date" {...register("estimatedEndDate")} />
        </Field>
      </div>
    </div>
  )
}

// ─── Step 8: Confirm ──────────────────────────────────────────────────────────

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  )
}


function ConfirmStep({
  form,
  onGoToStep,
  isEditMode = false,
  amendingOrderRef,
}: {
  form: UseFormReturn<OrderFormValues>
  onGoToStep: (stepId: string) => void
  isEditMode?: boolean
  amendingOrderRef?: string
}) {
  const values = form.watch()
  const total = calculateOrderTotal(values)
  const schedule = values.invoiceSchedule

  return (
    <div className="flex flex-col gap-6">
      {isEditMode && amendingOrderRef && (
        <p className="text-sm font-medium text-brand">
          Amending Order #{amendingOrderRef}
        </p>
      )}

      <div className="rounded-xl bg-brand/10 border border-brand/20 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Total Order Value
        </p>
        <p className="text-3xl font-bold text-brand">{formatCurrency(total)}</p>
      </div>

      <SummaryCard title="Customer" onEdit={() => onGoToStep(STEP_CUSTOMER)}>
        <SummaryRow label="Company" value={values.companyName} />
        <SummaryRow label="Contact" value={values.contactName} />
        <SummaryRow label="Email" value={values.email} />
        <SummaryRow label="Phone" value={values.phone} />
        <SummaryRow
          label="Customer type"
          value={values.isNewCustomer ? "New customer" : "Existing customer"}
        />
        {values.isNewCustomer && (
          <>
            <SummaryRow label="Address line 1" value={values.billingLine1} />
            <SummaryRow label="Address line 2" value={values.billingLine2} />
            <SummaryRow label="Town / city" value={values.billingTown} />
            <SummaryRow label="County" value={values.billingCounty} />
            <SummaryRow label="Postcode" value={values.billingPostcode} />
            <SummaryRow label="Country" value={values.billingCountry} />
          </>
        )}
      </SummaryCard>

      <SummaryCard title="Account Contact" onEdit={() => onGoToStep(STEP_ACCOUNT_CONTACT)}>
        {values.accountSameAsCustomer ? (
          <p className="text-sm text-muted-foreground">Same as customer contact</p>
        ) : (
          <>
            <SummaryRow label="Company" value={values.accountCompanyName} />
            <SummaryRow label="Contact" value={values.accountContactName} />
            <SummaryRow label="Email" value={values.accountEmail} />
          </>
        )}
      </SummaryCard>

      <SummaryCard title="Sales Info" onEdit={() => onGoToStep(STEP_SALES_INFO)}>
        <SummaryRow label="Salesperson" value={values.salesperson} />
        <SummaryRow label="Requirement type" value={values.requirementType} />
        <SummaryRow label="Sub-type" value={values.requirementSubType} />
      </SummaryCard>

      <SummaryCard title="Hours" onEdit={() => onGoToStep(STEP_HOURS)}>
        <HoursDisplay
          requirementType={values.requirementType ?? ''}
          hourlyRate={safeNum(values.hourlyRate)}
          entries={values.hoursEntries}
        />
      </SummaryCard>

      <SummaryCard title="Rate & Invoicing Schedule" onEdit={() => onGoToStep(STEP_RATE)}>
        <SummaryRow label="Hourly rate" value={`£${values.hourlyRate}/hr`} />
        {(values.additionalOngoingCosts ?? 0) > 0 && (
          <SummaryRow
            label="Ongoing costs"
            value={formatCurrency(values.additionalOngoingCosts!)}
          />
        )}
        {(values.additionalOutcosts ?? 0) > 0 && (
          <SummaryRow
            label="Outcosts"
            value={formatCurrency(values.additionalOutcosts!)}
          />
        )}
        {schedule.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/60 text-left">
                  <th className="px-3 py-2 font-medium">Milestone</th>
                  <th className="px-3 py-2 font-medium text-right">%</th>
                  <th className="px-3 py-2 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="px-3 py-2">
                      {item.date
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
        )}
      </SummaryCard>

      <SummaryCard title="Project Details" onEdit={() => onGoToStep(STEP_PROJECT)}>
        <SummaryRow label="Project name" value={values.projectName} />
        <SummaryRow label="Description" value={values.projectDescription} />
        <SummaryRow label="Start date" value={values.estimatedStartDate} />
        <SummaryRow label="End date" value={values.estimatedEndDate} />
      </SummaryCard>
    </div>
  )
}

// ─── Step field map (single source of truth for which fields live in which step)

const STEP_FIELD_MAP: Partial<Record<string, (keyof OrderFormValues)[]>> = {
  [STEP_CUSTOMER]: ["companyName", "contactName", "email", "phone"],
  [STEP_BILLING]: ["billingLine1", "billingTown", "billingPostcode", "billingCountry"],
  [STEP_ACCOUNT_CONTACT]: ["accountCompanyName", "accountContactName", "accountEmail"],
  [STEP_SALES_INFO]: ["salesperson", "requirementType", "requirementSubType"],
  [STEP_HOURS]: ["hoursEntries"],
  [STEP_RATE]: ["hourlyRate", "invoiceSchedule"],
  [STEP_PROJECT]: ["projectName", "estimatedStartDate"],
}

function stepHasErrors(
  stepId: string,
  errors: UseFormReturn<OrderFormValues>["formState"]["errors"]
): boolean {
  if (stepId === STEP_RATE) {
    const scheduleRootError =
      errors.invoiceSchedule && !Array.isArray(errors.invoiceSchedule)
        ? true
        : !!(errors.invoiceSchedule as { root?: unknown } | undefined)?.root
    return !!(errors.hourlyRate || scheduleRootError)
  }
  const fields = STEP_FIELD_MAP[stepId] ?? []
  return fields.some((f) => !!errors[f])
}

function getStepFields(
  stepId: string,
  values: OrderFormValues
): (keyof OrderFormValues)[] {
  if (stepId === STEP_ACCOUNT_CONTACT) {
    return values.accountSameAsCustomer ? [] : (STEP_FIELD_MAP[STEP_ACCOUNT_CONTACT] ?? [])
  }
  if (stepId === STEP_SALES_INFO) {
    const fields: (keyof OrderFormValues)[] = ["salesperson", "requirementType"]
    if (SUB_TYPE_REQUIRED_FOR.includes(values.requirementType ?? "")) {
      fields.push("requirementSubType")
    }
    return fields
  }
  if (stepId === STEP_HOURS) return []
  return STEP_FIELD_MAP[stepId] ?? []
}

// ─── Main OrderForm component ─────────────────────────────────────────────────

type OrderFormProps = {
  defaultValues?: OrderFormValues
  submitAction: (values: OrderFormValues) => Promise<{ id: string } | { error: string }>
  onSuccess: (id: string) => void
  isEditMode?: boolean
  amendingOrderRef?: string
  pageTitle?: string
}

export function OrderForm({
  defaultValues = NEW_ORDER_DEFAULTS,
  submitAction,
  onSuccess,
  isEditMode = false,
  amendingOrderRef,
  pageTitle = "New Order",
}: OrderFormProps) {
  const [currentStepId, setCurrentStepId] = React.useState<string>(STEP_CUSTOMER)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
    mode: "onTouched",
  })

  const isNewCustomer = form.watch("isNewCustomer")

  const visibleSteps = ALL_STEPS.filter((s) => s.id !== STEP_BILLING || isNewCustomer)

  React.useEffect(() => {
    const still = visibleSteps.some((s) => s.id === currentStepId)
    if (!still) {
      const currentAllIdx = ALL_STEPS.findIndex((s) => s.id === currentStepId)
      const prev = visibleSteps.filter(
        (s) => ALL_STEPS.findIndex((d) => d.id === s.id) < currentAllIdx
      )
      setCurrentStepId((prev[prev.length - 1] ?? visibleSteps[0]).id)
    }
  }, [visibleSteps, currentStepId])

  const currentStepIndex = visibleSteps.findIndex((s) => s.id === currentStepId)
  const { errors } = form.formState

  const indicatorSteps: FormStep[] = visibleSteps.map((step, idx) => {
    let state: FormStep["state"] = "pending"
    if (idx === currentStepIndex) {
      state = "active"
    } else if (idx < currentStepIndex) {
      state = stepHasErrors(step.id, errors) ? "error" : "completed"
    }
    return {
      id: step.id,
      label: step.label,
      state,
      onClick: idx < currentStepIndex ? () => setCurrentStepId(step.id) : undefined,
    }
  })

  const goNext = async () => {
    const fields = getStepFields(currentStepId, form.getValues())
    if (fields.length > 0) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    const next = visibleSteps[currentStepIndex + 1]
    if (next) setCurrentStepId(next.id)
  }

  const goBack = () => {
    const prev = visibleSteps[currentStepIndex - 1]
    if (prev) setCurrentStepId(prev.id)
  }

  const isLastStep = currentStepIndex === visibleSteps.length - 1

  async function handleSubmit(values: OrderFormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const result = await submitAction(values)
      if ('error' in result) {
        setSubmitError(result.error)
        return
      }
      onSuccess(result.id)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleInvalid() {
    setSubmitError('Some required fields are incomplete. Please review the steps above.')
  }

  const currentStepLabel =
    ALL_STEPS.find((s) => s.id === currentStepId)?.label ?? "Step"

  function renderStep() {
    switch (currentStepId) {
      case STEP_CUSTOMER:
        return <CustomerInfoStep form={form} />
      case STEP_BILLING:
        return <NewCustomerDetailsStep form={form} />
      case STEP_ACCOUNT_CONTACT:
        return <AccountContactStep form={form} />
      case STEP_SALES_INFO:
        return <SalesInfoStep form={form} />
      case STEP_HOURS:
        return <HoursStep form={form} />
      case STEP_RATE:
        return <RateStep form={form} />
      case STEP_PROJECT:
        return <ProjectDetailsStep form={form} />
      case STEP_CONFIRM:
        return (
          <ConfirmStep
            form={form}
            onGoToStep={setCurrentStepId}
            isEditMode={isEditMode}
            amendingOrderRef={amendingOrderRef}
          />
        )
      default:
        return (
          <p className="text-sm text-muted-foreground">
            {currentStepLabel} will be available in the next release.
          </p>
        )
    }
  }

  const submitLabel = isLastStep
    ? isSubmitting
      ? isEditMode ? "Submitting…" : "Submitting…"
      : isEditMode ? "Submit Amendment" : "Submit Order"
    : "Next"

  return (
    <div className={cn("mx-auto max-w-2xl px-4 py-8 sm:px-6")}>
      <h1 className="mb-6 text-xl font-semibold">{pageTitle}</h1>

      <div className="mb-8 overflow-x-auto pb-1">
        <StepIndicator steps={indicatorSteps} />
      </div>

      <div
        className="mb-8"
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !isLastStep &&
            (e.target as HTMLElement).tagName === "INPUT" &&
            (e.target as HTMLInputElement).type !== "radio" &&
            (e.target as HTMLInputElement).type !== "checkbox"
          ) {
            e.preventDefault()
            goNext()
          }
        }}
      >
        {renderStep()}
      </div>

      {submitError && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={currentStepIndex === 0 || isSubmitting}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={isLastStep ? form.handleSubmit(handleSubmit, handleInvalid) : goNext}
          disabled={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

// ─── Edit Order convenience wrapper ──────────────────────────────────────────

export function EditOrderForm({
  orderId,
  order,
}: {
  orderId: string
  order: FullOrder
}) {
  const router = useRouter()
  return (
    <OrderForm
      defaultValues={orderToFormValues(order)}
      submitAction={(values) => updateOrder(orderId, values)}
      onSuccess={(id) => router.push(`/orders/${id}?success=amended`)}
      isEditMode
      amendingOrderRef={orderId}
      pageTitle="Edit Order"
    />
  )
}
