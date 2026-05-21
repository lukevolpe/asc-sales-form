'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import type { OrderFormValues } from '@/lib/schemas/order';
import { Field } from '../shared';

export function NewCustomerDetailsStep({
  form,
}: {
  form: UseFormReturn<OrderFormValues>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Address line 1"
        required
        error={errors.billingLine1?.message}
      >
        <Input
          {...register('billingLine1')}
          placeholder="123 Main Street"
          aria-invalid={!!errors.billingLine1}
        />
      </Field>
      <Field label="Address line 2" error={errors.billingLine2?.message}>
        <Input {...register('billingLine2')} placeholder="Suite 4" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Town / city" required error={errors.billingTown?.message}>
          <Input
            {...register('billingTown')}
            placeholder="Leeds"
            aria-invalid={!!errors.billingTown}
          />
        </Field>
        <Field label="County" error={errors.billingCounty?.message}>
          <Input {...register('billingCounty')} placeholder="West Yorkshire" />
        </Field>
        <Field
          label="Postcode"
          required
          error={errors.billingPostcode?.message}
        >
          <Input
            {...register('billingPostcode')}
            placeholder="LS1 4DY"
            aria-invalid={!!errors.billingPostcode}
          />
        </Field>
        <Field label="Country" required error={errors.billingCountry?.message}>
          <Input
            {...register('billingCountry')}
            placeholder="United Kingdom"
            aria-invalid={!!errors.billingCountry}
          />
        </Field>
      </div>
    </div>
  );
}
