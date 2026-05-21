import * as React from 'react';
import { Label } from '@/components/ui/label';

export function safeNum(n: number | undefined | null): number {
  return Number.isFinite(n) ? (n ?? 0) : 0;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
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
  );
}
