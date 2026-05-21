'use client';

import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { OrderFormValues } from '@/lib/schemas/order';
import { Field } from '../shared';

export function ProjectDetailsStep({
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
      <Field label="Project name / summary" error={errors.projectName?.message}>
        <Input {...register('projectName')} placeholder="Website redesign" />
      </Field>
      <Field
        label="Description of requirements"
        error={errors.projectDescription?.message}
      >
        <textarea
          {...register('projectDescription')}
          rows={4}
          placeholder="Describe the project requirements…"
          className={cn(
            'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none resize-none',
            'placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Estimated start date"
          error={errors.estimatedStartDate?.message}
        >
          <Input type="date" {...register('estimatedStartDate')} />
        </Field>
        <Field
          label="Estimated end date"
          error={errors.estimatedEndDate?.message}
        >
          <Input type="date" {...register('estimatedEndDate')} />
        </Field>
      </div>
    </div>
  );
}
