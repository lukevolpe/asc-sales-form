import { z } from "zod"
import { SUB_TYPE_REQUIRED_FOR } from '@/lib/constants/requirementTypes'

export const orderFormSchema = z
  .object({
    // Step 1 — Customer Information
    companyName: z.string().min(1, "Company name is required"),
    contactName: z.string().min(1, "Contact name is required"),
    email: z.string().min(1, "Email is required").email("Valid email is required"),
    phone: z.string().min(1, "Phone is required"),
    isNewCustomer: z.boolean(),

    // Step 2 — New Customer Details (conditional on isNewCustomer)
    billingLine1: z.string().optional(),
    billingLine2: z.string().optional(),
    billingTown: z.string().optional(),
    billingCounty: z.string().optional(),
    billingPostcode: z.string().optional(),
    billingCountry: z.string().optional(),

    // Step 3 — Account Contact
    accountSameAsCustomer: z.boolean(),
    accountCompanyName: z.string().optional(),
    accountContactName: z.string().optional(),
    accountEmail: z.string().optional(),

    // Step 4 — Sales Information
    salesperson: z.string().optional(),
    requirementType: z.string().optional(),
    requirementSubType: z.string().optional(),

    // Step 5 — Hours
    hoursEntries: z.array(
      z.object({
        roleName: z.string(),
        hours: z.number().optional(),
        setupHours: z.number().optional(),
        monthlyHours: z.number().optional(),
        months: z.number().int().optional(),
      })
    ),

    // Step 6 — Rate & Costs
    hourlyRate: z.number().min(0),
    additionalOngoingCosts: z.number().optional(),
    additionalOutcosts: z.number().optional(),

    // Step 6 — Invoicing Schedule
    invoiceScheduleMode: z.enum(['deposit', 'milestones']),
    invoiceSchedule: z.array(
      z.object({
        monthOffset: z.number().int().optional(),
        date: z.string().optional(),
        percentage: z.number(),
      })
    ),

    // Step 7 — Project Details
    projectName: z.string().optional(),
    projectDescription: z.string().optional(),
    estimatedStartDate: z.string().optional(),
    estimatedEndDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isNewCustomer) {
      if (!data.billingLine1?.trim()) {
        ctx.addIssue({ code: "custom", message: "Address line 1 is required", path: ["billingLine1"] })
      }
      if (!data.billingTown?.trim()) {
        ctx.addIssue({ code: "custom", message: "Town / city is required", path: ["billingTown"] })
      }
      if (!data.billingPostcode?.trim()) {
        ctx.addIssue({ code: "custom", message: "Postcode is required", path: ["billingPostcode"] })
      }
      if (!data.billingCountry?.trim()) {
        ctx.addIssue({ code: "custom", message: "Country is required", path: ["billingCountry"] })
      }
    }
    if (!data.accountSameAsCustomer) {
      if (!data.accountCompanyName?.trim()) {
        ctx.addIssue({ code: "custom", message: "Company name is required", path: ["accountCompanyName"] })
      }
      if (!data.accountContactName?.trim()) {
        ctx.addIssue({ code: "custom", message: "Contact name is required", path: ["accountContactName"] })
      }
      if (!data.accountEmail?.trim()) {
        ctx.addIssue({ code: "custom", message: "Email is required", path: ["accountEmail"] })
      }
    }
    if (!data.salesperson?.trim()) {
      ctx.addIssue({ code: "custom", message: "Salesperson is required", path: ["salesperson"] })
    }
    if (!data.requirementType?.trim()) {
      ctx.addIssue({ code: "custom", message: "Type of requirement is required", path: ["requirementType"] })
    }
    if (
      SUB_TYPE_REQUIRED_FOR.includes(data.requirementType ?? "") &&
      !data.requirementSubType?.trim()
    ) {
      ctx.addIssue({ code: "custom", message: "Sub-type is required", path: ["requirementSubType"] })
    }
  })

export type OrderFormValues = z.infer<typeof orderFormSchema>
