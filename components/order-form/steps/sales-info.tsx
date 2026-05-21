'use client';

import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { CardSelect } from '@/components/ui/card-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrderFormValues } from '@/lib/schemas/order';
import { SALESPEOPLE } from '@/lib/constants/salespeople';
import {
  REQUIREMENT_TYPES,
  REQUIREMENT_SUB_TYPES,
  SUB_TYPE_REQUIRED_FOR,
  getDefaultHoursEntries,
} from '@/lib/constants/requirementTypes';
import { Field, FieldError } from '../shared';

export function SalesInfoStep({
  form,
}: {
  form: UseFormReturn<OrderFormValues>;
}) {
  const {
    formState: { errors },
    watch,
    setValue,
  } = form;

  const requirementType = watch('requirementType');
  const requirementSubType = watch('requirementSubType');
  const showSubType = SUB_TYPE_REQUIRED_FOR.includes(requirementType ?? '');

  function handleTypeChange(newType: string) {
    setValue('requirementType', newType);
    if (!SUB_TYPE_REQUIRED_FOR.includes(newType)) {
      setValue('requirementSubType', '');
    }
    setValue('hoursEntries', getDefaultHoursEntries(newType));
  }

  return (
    <div className="flex flex-col gap-6">
      <Field label="Salesperson" required error={errors.salesperson?.message}>
        <Controller
          control={form.control}
          name="salesperson"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger
                className="w-full"
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
          value={requirementType ?? ''}
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
            value={requirementSubType ?? ''}
            onChange={(v) => setValue('requirementSubType', v)}
            options={REQUIREMENT_SUB_TYPES.map((s) => ({ label: s, value: s }))}
          />
          {errors.requirementSubType && (
            <FieldError message={errors.requirementSubType.message} />
          )}
        </div>
      )}
    </div>
  );
}
