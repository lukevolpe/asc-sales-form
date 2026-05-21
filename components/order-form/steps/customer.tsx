'use client';

import type { UseFormReturn } from 'react-hook-form';
import { CardSelect } from '@/components/ui/card-select';
import { Input } from '@/components/ui/input';
import type { OrderFormValues } from '@/lib/schemas/order';
import { Field } from '../shared';

export function CustomerInfoStep({
  form,
}: {
  form: UseFormReturn<OrderFormValues>;
}) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const isNewCustomer = watch('isNewCustomer');

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Company name"
          required
          error={errors.companyName?.message}
        >
          <Input
            {...register('companyName')}
            placeholder="Acme Ltd"
            aria-invalid={!!errors.companyName}
          />
        </Field>
        <Field
          label="Contact name"
          required
          error={errors.contactName?.message}
        >
          <Input
            {...register('contactName')}
            placeholder="Jane Smith"
            aria-invalid={!!errors.contactName}
          />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input
            type="email"
            {...register('email')}
            placeholder="jane@example.com"
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field label="Phone" required error={errors.phone?.message}>
          <Input
            type="tel"
            {...register('phone')}
            placeholder="+44 7700 900000"
            aria-invalid={!!errors.phone}
          />
        </Field>
      </div>

      <CardSelect
        legend="Customer type"
        name="isNewCustomer"
        value={isNewCustomer ? 'new' : 'existing'}
        onChange={(v) => setValue('isNewCustomer', v === 'new')}
        options={[
          { label: 'Existing customer', value: 'existing' },
          { label: 'New customer', value: 'new' },
        ]}
      />
    </div>
  );
}
