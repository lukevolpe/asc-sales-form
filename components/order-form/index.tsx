'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { StepIndicator, type FormStep } from '@/components/step-indicator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { orderFormSchema, type OrderFormValues } from '@/lib/schemas/order';
import { HoursMatrix } from '@/components/hours-matrix';
import { updateOrder } from '@/app/actions/orders';
import type { FullOrder } from '@/lib/orders';
import { orderToFormValues } from '@/lib/orders';
import {
  STEP_CUSTOMER,
  STEP_BILLING,
  STEP_ACCOUNT_CONTACT,
  STEP_SALES_INFO,
  STEP_HOURS,
  STEP_RATE,
  STEP_PROJECT,
  STEP_CONFIRM,
  ALL_STEPS,
  NEW_ORDER_DEFAULTS,
  stepHasErrors,
  getStepFields,
} from './constants';
import { CustomerInfoStep } from './steps/customer';
import { NewCustomerDetailsStep } from './steps/billing';
import { AccountContactStep } from './steps/account-contact';
import { SalesInfoStep } from './steps/sales-info';
import { RateStep } from './steps/rate';
import { ProjectDetailsStep } from './steps/project';
import { ConfirmStep } from './steps/confirm';

export { NEW_ORDER_DEFAULTS };

// ─── Main OrderForm component ─────────────────────────────────────────────────

type OrderFormProps = {
  defaultValues?: OrderFormValues;
  submitAction: (
    values: OrderFormValues,
  ) => Promise<{ id: string } | { error: string }>;
  onSuccess: (id: string) => void;
  isEditMode?: boolean;
  amendingOrderRef?: string;
  pageTitle?: string;
};

const DRAFT_KEY = 'asc-order-draft';

export function OrderForm({
  defaultValues = NEW_ORDER_DEFAULTS,
  submitAction,
  onSuccess,
  isEditMode = false,
  amendingOrderRef,
  pageTitle = 'New Order',
}: OrderFormProps) {
  const [currentStepId, setCurrentStepId] =
    React.useState<string>(STEP_CUSTOMER);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDraftBanner, setShowDraftBanner] = React.useState(false);
  const draftValuesRef = React.useRef<OrderFormValues | null>(null);
  const [rateStepAttempted, setRateStepAttempted] = React.useState(false);
  const stepContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = stepContainerRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), select, textarea',
    );
    el?.focus();
  }, [currentStepId]);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  // Restore draft prompt (new orders only)
  React.useEffect(() => {
    if (isEditMode) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as OrderFormValues;
      if (parsed.companyName || parsed.projectName) {
        draftValuesRef.current = parsed;
        setShowDraftBanner(true);
      }
    } catch {
      // ignore malformed draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist form values to sessionStorage (new orders only, debounced 500ms)
  React.useEffect(() => {
    if (isEditMode) return;
    const sub = form.watch((values) => {
      const timer = setTimeout(() => {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        } catch {
          // ignore quota errors
        }
      }, 500);
      return () => clearTimeout(timer);
    });
    return () => sub.unsubscribe();
  }, [form, isEditMode]);

  const isNewCustomer = useWatch({ control: form.control, name: 'isNewCustomer' });

  const visibleSteps = ALL_STEPS.filter(
    (s) => s.id !== STEP_BILLING || isNewCustomer,
  );

  React.useEffect(() => {
    const still = visibleSteps.some((s) => s.id === currentStepId);
    if (!still) {
      const currentAllIdx = ALL_STEPS.findIndex((s) => s.id === currentStepId);
      const prev = visibleSteps.filter(
        (s) => ALL_STEPS.findIndex((d) => d.id === s.id) < currentAllIdx,
      );
      setCurrentStepId((prev[prev.length - 1] ?? visibleSteps[0]).id);
    }
  }, [visibleSteps, currentStepId]);

  const currentStepIndex = visibleSteps.findIndex(
    (s) => s.id === currentStepId,
  );
  const { errors } = form.formState;

  const indicatorSteps: FormStep[] = visibleSteps.map((step, idx) => {
    let state: FormStep['state'] = 'pending';
    if (idx === currentStepIndex) {
      state = 'active';
    } else if (idx < currentStepIndex) {
      state = stepHasErrors(step.id, errors) ? 'error' : 'completed';
    }
    return {
      id: step.id,
      label: step.label,
      state,
      onClick:
        idx < currentStepIndex ? () => setCurrentStepId(step.id) : undefined,
    };
  });

  const goNext = async () => {
    if (currentStepId === STEP_RATE) setRateStepAttempted(true);
    const fields = getStepFields(currentStepId, form.getValues());
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }
    const next = visibleSteps[currentStepIndex + 1];
    if (next) setCurrentStepId(next.id);
  };

  const goBack = () => {
    const prev = visibleSteps[currentStepIndex - 1];
    if (prev) setCurrentStepId(prev.id);
  };

  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  const restoreDraft = () => {
    if (draftValuesRef.current) {
      form.reset(draftValuesRef.current);
    }
    setShowDraftBanner(false);
  };

  const dismissDraft = () => {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setShowDraftBanner(false);
  };

  async function handleSubmit(values: OrderFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await submitAction(values);
      if ('error' in result) {
        setSubmitError(result.error);
        return;
      }
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      onSuccess(result.id);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleInvalid() {
    setSubmitError(
      'Some required fields are incomplete. Please review the steps above.',
    );
  }

  const currentStepLabel =
    ALL_STEPS.find((s) => s.id === currentStepId)?.label ?? 'Step';

  function renderStep() {
    switch (currentStepId) {
      case STEP_CUSTOMER:
        return <CustomerInfoStep form={form} />;
      case STEP_BILLING:
        return <NewCustomerDetailsStep form={form} />;
      case STEP_ACCOUNT_CONTACT:
        return <AccountContactStep form={form} />;
      case STEP_SALES_INFO:
        return <SalesInfoStep form={form} />;
      case STEP_HOURS:
        return <HoursMatrix form={form} />;
      case STEP_RATE:
        return <RateStep form={form} attempted={rateStepAttempted} />;
      case STEP_PROJECT:
        return <ProjectDetailsStep form={form} />;
      case STEP_CONFIRM:
        return (
          <ConfirmStep
            form={form}
            isEditMode={isEditMode}
            amendingOrderRef={amendingOrderRef}
          />
        );
      default:
        return (
          <p className="text-sm text-muted-foreground">
            {currentStepLabel} will be available in the next release.
          </p>
        );
    }
  }

  const submitLabel = isLastStep
    ? isEditMode
      ? 'Submit Amendment'
      : 'Submit Order'
    : 'Next';

  return (
    <div className={cn('mx-auto max-w-2xl px-4 py-8 sm:px-6')}>
      <h1 className="mb-6 text-xl font-semibold">{pageTitle}</h1>

      {showDraftBanner && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-brand/30 bg-brand/10 px-4 py-3 text-sm">
          <span className="text-brand font-medium">
            You have an unsaved draft.
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="text-brand font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 overflow-x-auto pb-1">
        <StepIndicator steps={indicatorSteps} />
      </div>

      <div
        ref={stepContainerRef}
        className="mb-8"
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' &&
            !isLastStep &&
            (e.target as HTMLElement).tagName === 'INPUT' &&
            (e.target as HTMLInputElement).type !== 'radio' &&
            (e.target as HTMLInputElement).type !== 'checkbox'
          ) {
            e.preventDefault();
            goNext();
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

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2"
          onClick={goBack}
          disabled={currentStepIndex === 0 || isSubmitting}
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          className="h-11 gap-2"
          onClick={
            isLastStep ? form.handleSubmit(handleSubmit, handleInvalid) : goNext
          }
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              {submitLabel}
              {!isLastStep && <ChevronRight className="size-4" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Edit Order convenience wrapper ──────────────────────────────────────────

export function EditOrderForm({
  orderId,
  order,
}: {
  orderId: string;
  order: FullOrder;
}) {
  const router = useRouter();
  return (
    <OrderForm
      defaultValues={orderToFormValues(order)}
      submitAction={(values) => updateOrder(orderId, values)}
      onSuccess={(id) => router.push(`/orders/${id}?success=amended`)}
      isEditMode
      amendingOrderRef={orderId}
      pageTitle="Edit Order"
    />
  );
}
