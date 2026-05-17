"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { StepIndicator, type FormStep } from "@/components/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { orderFormSchema, type OrderFormValues } from "@/lib/schemas/order"

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
        {required && <span className="text-destructive ml-0.5" aria-hidden>*</span>}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

function RadioGroup({
  legend,
  children,
}: {
  legend: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-4">{children}</div>
    </fieldset>
  )
}

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        className="accent-brand"
        checked={checked}
        onChange={onChange}
      />
      <span className="text-sm">{label}</span>
    </label>
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

      <RadioGroup legend="Customer type">
        <RadioOption
          label="Existing customer"
          checked={!isNewCustomer}
          onChange={() => setValue("isNewCustomer", false)}
        />
        <RadioOption
          label="New customer"
          checked={isNewCustomer}
          onChange={() => setValue("isNewCustomer", true)}
        />
      </RadioGroup>
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
      <RadioGroup legend="Accounts contact">
        <RadioOption
          label="Same as customer contact"
          checked={accountSameAsCustomer}
          onChange={() => setValue("accountSameAsCustomer", true)}
        />
        <RadioOption
          label="Different contact"
          checked={!accountSameAsCustomer}
          onChange={() => setValue("accountSameAsCustomer", false)}
        />
      </RadioGroup>

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

  const getMode = (fieldId: string): "month" | "date" => rowModes[fieldId] ?? "month"

  const setMode = (fieldId: string, mode: "month" | "date", index: number) => {
    if (mode === "month") {
      setValue(`invoiceSchedule.${index}.date`, undefined)
    } else {
      setValue(`invoiceSchedule.${index}.monthOffset`, undefined)
    }
    setRowModes((prev) => ({ ...prev, [fieldId]: mode }))
  }

  const addMilestone = () => {
    append({ percentage: 0 })
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
          const mode = getMode(field.id)
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
            {...register("additionalOngoingCosts", { valueAsNumber: true })}
            placeholder="0"
          />
        </Field>
        <Field label="Additional Outcosts (£)" error={errors.additionalOutcosts?.message}>
          <Input
            type="number"
            min="0"
            step="0.01"
            {...register("additionalOutcosts", { valueAsNumber: true })}
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

// ─── Placeholder for future steps ────────────────────────────────────────────

function PlaceholderStep({ label }: { label: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      {label} will be available in the next release.
    </p>
  )
}

// ─── Step error detection ─────────────────────────────────────────────────────

function stepHasErrors(
  stepId: string,
  errors: UseFormReturn<OrderFormValues>["formState"]["errors"]
): boolean {
  switch (stepId) {
    case STEP_CUSTOMER:
      return !!(
        errors.companyName ||
        errors.contactName ||
        errors.email ||
        errors.phone
      )
    case STEP_BILLING:
      return !!(
        errors.billingLine1 ||
        errors.billingTown ||
        errors.billingPostcode ||
        errors.billingCountry
      )
    case STEP_ACCOUNT_CONTACT:
      return !!(
        errors.accountCompanyName ||
        errors.accountContactName ||
        errors.accountEmail
      )
    case STEP_RATE: {
      const scheduleRootError =
        errors.invoiceSchedule && !Array.isArray(errors.invoiceSchedule)
          ? true
          : !!(errors.invoiceSchedule as { root?: unknown } | undefined)?.root
      return !!(errors.hourlyRate || scheduleRootError)
    }
    case STEP_PROJECT:
      return !!(errors.projectName || errors.estimatedStartDate)
    default:
      return false
  }
}

// ─── Fields to validate per step ─────────────────────────────────────────────

function getStepFields(
  stepId: string,
  values: OrderFormValues
): (keyof OrderFormValues)[] {
  switch (stepId) {
    case STEP_CUSTOMER:
      return ["companyName", "contactName", "email", "phone"]
    case STEP_BILLING:
      return ["billingLine1", "billingTown", "billingPostcode", "billingCountry"]
    case STEP_ACCOUNT_CONTACT:
      return values.accountSameAsCustomer
        ? []
        : ["accountCompanyName", "accountContactName", "accountEmail"]
    case STEP_RATE:
      return ["hourlyRate", "invoiceSchedule"]
    default:
      return []
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewOrderPage() {
  const [currentStepId, setCurrentStepId] = React.useState<string>(STEP_CUSTOMER)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
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
    },
    mode: "onTouched",
  })

  const isNewCustomer = form.watch("isNewCustomer")

  const visibleSteps = ALL_STEPS.filter((s) => s.id !== STEP_BILLING || isNewCustomer)

  // When isNewCustomer changes and removes the billing step, fall back
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
      case STEP_RATE:
        return <RateStep form={form} />
      case STEP_PROJECT:
        return <ProjectDetailsStep form={form} />
      default:
        return <PlaceholderStep label={currentStepLabel} />
    }
  }

  return (
    <div className={cn("mx-auto max-w-2xl px-4 py-8 sm:px-6")}>
      <h1 className="mb-6 text-xl font-semibold">New Order</h1>

      <div className="mb-8 overflow-x-auto pb-1">
        <StepIndicator steps={indicatorSteps} />
      </div>

      <div className="mb-8">{renderStep()}</div>

      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={currentStepIndex === 0}
        >
          Back
        </Button>
        <Button type="button" onClick={isLastStep ? undefined : goNext}>
          {isLastStep ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  )
}
