'use client';

import type { UseFormReturn } from 'react-hook-form';
import { CardSelect } from '@/components/ui/card-select';
import { Input } from '@/components/ui/input';
import type { OrderFormValues } from '@/lib/schemas/order';
import { Field } from '../shared';

export function AccountContactStep({
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
  const accountSameAsCustomer = watch('accountSameAsCustomer');

  return (
    <div className="flex flex-col gap-6">
      <CardSelect
        legend="Accounts contact"
        name="accountSameAsCustomer"
        value={accountSameAsCustomer ? 'same' : 'different'}
        onChange={(v) => setValue('accountSameAsCustomer', v === 'same')}
        options={[
          { label: 'Same as customer contact', value: 'same' },
          { label: 'Different contact', value: 'different' },
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
              {...register('accountCompanyName')}
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
                {...register('accountContactName')}
                placeholder="John Finance"
                aria-invalid={!!errors.accountContactName}
              />
            </Field>
            <Field label="Email" required error={errors.accountEmail?.message}>
              <Input
                type="email"
                {...register('accountEmail')}
                placeholder="accounts@acme.com"
                aria-invalid={!!errors.accountEmail}
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
