import type { UseFormReturn } from 'react-hook-form';
import type { OrderFormValues } from '@/lib/schemas/order';
import { SUB_TYPE_REQUIRED_FOR } from '@/lib/constants/requirementTypes';

// ─── Step IDs ────────────────────────────────────────────────────────────────

export const STEP_CUSTOMER = 'customer';
export const STEP_BILLING = 'billing';
export const STEP_ACCOUNT_CONTACT = 'account-contact';
export const STEP_SALES_INFO = 'sales-info';
export const STEP_HOURS = 'hours';
export const STEP_RATE = 'rate';
export const STEP_PROJECT = 'project';
export const STEP_CONFIRM = 'confirm';

export const ALL_STEPS = [
  { id: STEP_CUSTOMER, label: 'Customer' },
  { id: STEP_BILLING, label: 'Billing Address' },
  { id: STEP_ACCOUNT_CONTACT, label: 'Account Contact' },
  { id: STEP_SALES_INFO, label: 'Sales Info' },
  { id: STEP_HOURS, label: 'Hours' },
  { id: STEP_RATE, label: 'Rate & Schedule' },
  { id: STEP_PROJECT, label: 'Project Details' },
  { id: STEP_CONFIRM, label: 'Confirm' },
] as const;

// ─── Default values for a new order ──────────────────────────────────────────

export const NEW_ORDER_DEFAULTS: OrderFormValues = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  isNewCustomer: false,
  billingLine1: '',
  billingLine2: '',
  billingTown: '',
  billingCounty: '',
  billingPostcode: '',
  billingCountry: '',
  accountSameAsCustomer: true,
  accountCompanyName: '',
  accountContactName: '',
  accountEmail: '',
  salesperson: '',
  requirementType: '',
  requirementSubType: '',
  hoursEntries: [],
  hourlyRate: 110,
  additionalOngoingCosts: undefined,
  additionalOutcosts: undefined,
  invoiceSchedule: [],
  projectName: '',
  projectDescription: '',
  estimatedStartDate: '',
  estimatedEndDate: '',
};

// ─── Step field map ───────────────────────────────────────────────────────────

export const STEP_FIELD_MAP: Partial<Record<string, (keyof OrderFormValues)[]>> = {
  [STEP_CUSTOMER]: ['companyName', 'contactName', 'email', 'phone'],
  [STEP_BILLING]: [
    'billingLine1',
    'billingTown',
    'billingPostcode',
    'billingCountry',
  ],
  [STEP_ACCOUNT_CONTACT]: [
    'accountCompanyName',
    'accountContactName',
    'accountEmail',
  ],
  [STEP_SALES_INFO]: ['salesperson', 'requirementType', 'requirementSubType'],
  [STEP_HOURS]: ['hoursEntries'],
  [STEP_RATE]: ['hourlyRate', 'invoiceSchedule'],
  [STEP_PROJECT]: ['projectName', 'estimatedStartDate'],
};

export function stepHasErrors(
  stepId: string,
  errors: UseFormReturn<OrderFormValues>['formState']['errors'],
): boolean {
  if (stepId === STEP_RATE) {
    const scheduleRootError =
      errors.invoiceSchedule && !Array.isArray(errors.invoiceSchedule)
        ? true
        : !!(errors.invoiceSchedule as { root?: unknown } | undefined)?.root;
    return !!(errors.hourlyRate || scheduleRootError);
  }
  const fields = STEP_FIELD_MAP[stepId] ?? [];
  return fields.some((f) => !!errors[f]);
}

export function getStepFields(
  stepId: string,
  values: OrderFormValues,
): (keyof OrderFormValues)[] {
  if (stepId === STEP_ACCOUNT_CONTACT) {
    return values.accountSameAsCustomer
      ? []
      : (STEP_FIELD_MAP[STEP_ACCOUNT_CONTACT] ?? []);
  }
  if (stepId === STEP_SALES_INFO) {
    const fields: (keyof OrderFormValues)[] = [
      'salesperson',
      'requirementType',
    ];
    if (SUB_TYPE_REQUIRED_FOR.includes(values.requirementType ?? '')) {
      fields.push('requirementSubType');
    }
    return fields;
  }
  if (stepId === STEP_HOURS) return [];
  return STEP_FIELD_MAP[stepId] ?? [];
}
