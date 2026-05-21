'use client';

import * as React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import type { OrderFormValues } from '@/lib/schemas/order';
import { calculateOrderTotal } from '@/lib/orders';
import { formatCurrency } from '@/lib/format';
import { HoursDisplay } from '@/components/hours-display';
import { safeNum } from '../shared';
import {
  STEP_CUSTOMER,
  STEP_ACCOUNT_CONTACT,
  STEP_SALES_INFO,
  STEP_HOURS,
  STEP_RATE,
  STEP_PROJECT,
  STEP_FIELD_MAP,
} from '../constants';
import { CustomerInfoStep } from './customer';
import { AccountContactStep } from './account-contact';
import { SalesInfoStep } from './sales-info';
import { RateStep } from './rate';
import { ProjectDetailsStep } from './project';
import { HoursMatrix } from '@/components/hours-matrix';

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({
  title,
  onEdit,
  onSave,
  onCancel,
  isEditing = false,
  isSaving = false,
  editContent,
  children,
}: {
  title: string;
  onEdit: () => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  isSaving?: boolean;
  editContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          >
            Edit
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="flex flex-col gap-4">
          {editContent}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </div>
  );
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}

// ─── ConfirmStep ──────────────────────────────────────────────────────────────

export function ConfirmStep({
  form,
  isEditMode = false,
  amendingOrderRef,
}: {
  form: UseFormReturn<OrderFormValues>;
  isEditMode?: boolean;
  amendingOrderRef?: string;
}) {
  const values = form.watch();
  const total = calculateOrderTotal(values);
  const schedule = values.invoiceSchedule;
  const [editingStep, setEditingStep] = React.useState<string | null>(null);
  const [saveAttempted, setSaveAttempted] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const startEdit = (stepId: string) => {
    setSaveAttempted(null);
    setEditingStep(stepId);
  };
  const cancelEdit = () => {
    setSaveAttempted(null);
    setEditingStep(null);
  };

  const saveEdit = async (stepId: string) => {
    setSaveAttempted(stepId);
    const fields = (STEP_FIELD_MAP[stepId] ?? []) as (keyof OrderFormValues)[];
    setIsSaving(true);
    const valid = await form.trigger(fields);
    setIsSaving(false);
    if (valid) {
      setSaveAttempted(null);
      setEditingStep(null);
    }
  };

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

      <SummaryCard
        title="Customer"
        onEdit={() => startEdit(STEP_CUSTOMER)}
        onSave={() => saveEdit(STEP_CUSTOMER)}
        onCancel={cancelEdit}
        isEditing={editingStep === STEP_CUSTOMER}
        isSaving={isSaving}
        editContent={<CustomerInfoStep form={form} />}
      >
        <SummaryRow label="Company" value={values.companyName} />
        <SummaryRow label="Contact" value={values.contactName} />
        <SummaryRow label="Email" value={values.email} />
        <SummaryRow label="Phone" value={values.phone} />
        <SummaryRow
          label="Customer type"
          value={values.isNewCustomer ? 'New customer' : 'Existing customer'}
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

      <SummaryCard
        title="Account Contact"
        onEdit={() => startEdit(STEP_ACCOUNT_CONTACT)}
        onSave={() => saveEdit(STEP_ACCOUNT_CONTACT)}
        onCancel={cancelEdit}
        isEditing={editingStep === STEP_ACCOUNT_CONTACT}
        isSaving={isSaving}
        editContent={<AccountContactStep form={form} />}
      >
        {values.accountSameAsCustomer ? (
          <p className="text-sm text-muted-foreground">
            Same as customer contact
          </p>
        ) : (
          <>
            <SummaryRow label="Company" value={values.accountCompanyName} />
            <SummaryRow label="Contact" value={values.accountContactName} />
            <SummaryRow label="Email" value={values.accountEmail} />
          </>
        )}
      </SummaryCard>

      <SummaryCard
        title="Sales Info"
        onEdit={() => startEdit(STEP_SALES_INFO)}
        onSave={() => saveEdit(STEP_SALES_INFO)}
        onCancel={cancelEdit}
        isEditing={editingStep === STEP_SALES_INFO}
        isSaving={isSaving}
        editContent={<SalesInfoStep form={form} />}
      >
        <SummaryRow label="Salesperson" value={values.salesperson} />
        <SummaryRow label="Requirement type" value={values.requirementType} />
        <SummaryRow label="Sub-type" value={values.requirementSubType} />
      </SummaryCard>

      <SummaryCard
        title="Hours"
        onEdit={() => startEdit(STEP_HOURS)}
        onSave={() => saveEdit(STEP_HOURS)}
        onCancel={cancelEdit}
        isEditing={editingStep === STEP_HOURS}
        isSaving={isSaving}
        editContent={<HoursMatrix form={form} />}
      >
        <HoursDisplay
          requirementType={values.requirementType ?? ''}
          hourlyRate={safeNum(values.hourlyRate)}
          entries={values.hoursEntries}
        />
      </SummaryCard>

      <SummaryCard
        title="Rate & Invoicing Schedule"
        onEdit={() => startEdit(STEP_RATE)}
        onSave={() => saveEdit(STEP_RATE)}
        onCancel={cancelEdit}
        isEditing={editingStep === STEP_RATE}
        isSaving={isSaving}
        editContent={
          <RateStep form={form} attempted={saveAttempted === STEP_RATE} />
        }
      >
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
                        ? new Date(item.date).toLocaleDateString('en-GB')
                        : item.monthOffset
                          ? `Month ${item.monthOffset}`
                          : `Milestone ${idx + 1}`}
                    </td>
                    <td className="px-3 py-2 text-right">{item.percentage}%</td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency((item.percentage / 100) * total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SummaryCard>

      <SummaryCard
        title="Project Details"
        onEdit={() => startEdit(STEP_PROJECT)}
        onSave={() => saveEdit(STEP_PROJECT)}
        onCancel={cancelEdit}
        isEditing={editingStep === STEP_PROJECT}
        isSaving={isSaving}
        editContent={<ProjectDetailsStep form={form} />}
      >
        <SummaryRow label="Project name" value={values.projectName} />
        <SummaryRow label="Description" value={values.projectDescription} />
        <SummaryRow label="Start date" value={values.estimatedStartDate} />
        <SummaryRow label="End date" value={values.estimatedEndDate} />
      </SummaryCard>
    </div>
  );
}
