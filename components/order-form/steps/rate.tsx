'use client';

import * as React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { CardSelect } from '@/components/ui/card-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OrderFormValues } from '@/lib/schemas/order';
import { Field, FieldError } from '../shared';

export function RateStep({
  form,
  attempted,
}: {
  form: UseFormReturn<OrderFormValues>;
  attempted: boolean;
}) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoiceSchedule',
  });
  const [rowModes, setRowModes] = React.useState<
    Record<string, 'month' | 'date'>
  >({});
  const newRowRef = React.useRef<HTMLInputElement | null>(null);

  const schedule = watch('invoiceSchedule');
  const total = schedule.reduce((sum, item) => sum + (item.percentage || 0), 0);
  const totalRounded = Math.round(total);

  const prevLengthRef = React.useRef(fields.length);
  React.useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      newRowRef.current?.focus();
    }
    prevLengthRef.current = fields.length;
  }, [fields.length]);

  // Clear the opposite field after mode state has been applied to avoid racing
  // with RHF's setValue triggering a re-render before setRowModes resolves.
  React.useEffect(() => {
    fields.forEach((field, idx) => {
      const mode = rowModes[field.id];
      if (!mode) return;
      if (mode === 'month') {
        setValue(`invoiceSchedule.${idx}.date`, undefined);
      } else {
        setValue(`invoiceSchedule.${idx}.monthOffset`, undefined);
      }
    });
  }, [rowModes]); // eslint-disable-line react-hooks/exhaustive-deps

  const getMode = (fieldId: string, index: number): 'month' | 'date' => {
    if (fieldId in rowModes) return rowModes[fieldId];
    return schedule[index]?.date ? 'date' : 'month';
  };

  const setMode = (fieldId: string, mode: 'month' | 'date') => {
    setRowModes((prev) => ({ ...prev, [fieldId]: mode }));
  };

  const addMilestone = () => {
    append({ percentage: undefined as unknown as number });
  };

  const removeRow = (index: number, fieldId: string) => {
    remove(index);
    setRowModes((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const scheduleRootError =
    errors.invoiceSchedule && !Array.isArray(errors.invoiceSchedule)
      ? (errors.invoiceSchedule as { message?: string }).message
      : (errors.invoiceSchedule as { root?: { message?: string } } | undefined)
          ?.root?.message;

  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Hourly Rate (£/hr)"
        required
        error={errors.hourlyRate?.message}
      >
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground select-none">
            £
          </span>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register('hourlyRate', { valueAsNumber: true })}
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
              'text-xs font-medium tabular-nums',
              totalRounded === 100 ? 'text-green-600' : 'text-destructive',
            )}
          >
            {totalRounded}% / 100%
          </span>
        </div>

        {scheduleRootError && (
          <p className="text-xs text-destructive">{scheduleRootError}</p>
        )}

        {fields.map((field, index) => {
          const mode = getMode(field.id, index);
          const isLastRow = index === fields.length - 1;
          const rowErrors =
            attempted && Array.isArray(errors.invoiceSchedule)
              ? errors.invoiceSchedule[index]
              : undefined;
          return (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3"
            >
              <CardSelect
                legend="Timing"
                name={`invoiceSchedule-${index}-mode`}
                value={mode}
                onChange={(v) => setMode(field.id, v as 'month' | 'date')}
                options={[
                  { label: 'Month #', value: 'month' },
                  { label: 'Exact date', value: 'date' },
                ]}
                cols={2}
              />

              <div className="flex items-start gap-3">
                {mode === 'month' ? (
                  <Field
                    label="Month no."
                    error={rowErrors?.monthOffset?.message}
                  >
                    {(() => {
                      const { ref: rhfRef, ...monthProps } = register(
                        `invoiceSchedule.${index}.monthOffset`,
                        { valueAsNumber: true },
                      );
                      return (
                        <Input
                          type="number"
                          min="1"
                          {...monthProps}
                          ref={(el) => {
                            rhfRef(el);
                            if (isLastRow) newRowRef.current = el;
                          }}
                          className="w-24"
                          placeholder="e.g. 3"
                        />
                      );
                    })()}
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

                <div className="flex flex-col gap-1.5">
                  <span className="text-sm opacity-0 select-none" aria-hidden>x</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(index, field.id)}
                    aria-label="Remove milestone"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          );
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
            {...register('additionalOngoingCosts', {
              setValueAs: (v) =>
                v === '' || v === null || v === undefined
                  ? undefined
                  : Number(v),
            })}
            placeholder="0"
          />
        </Field>
        <Field
          label="Additional Outcosts (£)"
          error={errors.additionalOutcosts?.message}
        >
          <Input
            type="number"
            min="0"
            step="0.01"
            {...register('additionalOutcosts', {
              setValueAs: (v) =>
                v === '' || v === null || v === undefined
                  ? undefined
                  : Number(v),
            })}
            placeholder="0"
          />
        </Field>
      </div>
    </div>
  );
}
