# PRD: Ascensor Internal Sales Order App

## Problem Statement

The current sales order process at Ascensor is fragmented across multiple Google tools and manual steps. A salesperson fills out a 19-section Google Form, which populates a Google Sheet. They must then manually review and update every column in that sheet. Once satisfied, they trigger a custom Apps Script to email finance a link to a separate summary sheet. Finally, the order is manually re-entered into a separate projects tracking sheet. This process is slow, error-prone, visually difficult to parse, and offers no single source of truth. The repetitive structure of the Google Form (three near-identical sections for Website / Application / Software hours) makes it unnecessarily long and tedious to complete.

## Solution

An internal Next.js web application that replaces the Google Forms/Sheets workflow end-to-end. The app provides a clean, branded multi-step form that guides salespeople through raising a new order, presents a review screen for confirmation, auto-sends the finance email on submission, and maintains a searchable dashboard of all past orders. Each order has a permanent summary page that can be shared and used in place of the Google Sheet link. A one-click TSV copy on the summary page allows the project record to be pasted directly into the existing projects Google Sheet, bridging the gap until full project management is in scope.

---

## User Stories

### New Order Form

1. As a salesperson, I want to fill in a multi-step sales order form so that I can raise a new order without navigating a 19-section Google Form.
2. As a salesperson, I want the form to show only the sections relevant to my selected type of requirement so that I am not distracted by irrelevant fields.
3. As a salesperson, I want to enter customer details (company, contact name, email, phone) so that the order is associated with the correct client.
4. As a salesperson, I want to indicate whether the customer is new or existing so that new customer address and account contact fields appear only when needed.
5. As a salesperson filling in details for a new customer, I want to enter their billing address (line 1, line 2, town/city, county, postcode, country) so that finance has the correct invoicing address.
6. As a salesperson, I want to specify whether the accounts contact is the same as the customer contact so that I don't need to re-enter identical information.
7. As a salesperson, I want to enter a separate account company name, contact name, and email when the accounts contact differs from the customer so that finance can reach the right person.
8. As a salesperson, I want to select myself or a colleague from a dropdown as the salesperson so that I can submit orders on behalf of others.
9. As a salesperson, I want to choose the type of requirement (Air Website, Studio Project, Marketing Project, B2B/B2C Lead Gen, Advancement of Existing Website, BAU Retainer) so that the appropriate hours section is displayed.
10. As a salesperson raising a Studio Project or Advancement of Existing Website order, I want to select a sub-type (Website, Application, or Software) so that the order is labelled correctly.
11. As a salesperson, I want to enter hours in a clean matrix table with roles as rows (Design, UX, Frontend, Backend, Solutions, Hosting, Deployment) and a single hours column so that entry is fast and visually clear.
12. As a salesperson raising a Marketing Project or B2B/B2C Lead Gen order, I want a two-column matrix (Setup | Monthly) with channels as rows so that I can enter both one-off and recurring hours in a single view.
13. As a salesperson raising a Marketing Project or B2B/B2C Lead Gen order, I want to enter a number of months so that the total monthly hours can be factored into the order value.
14. As a salesperson raising a BAU Retainer order, I want dedicated fields for Studio Hours, Marketing Hours, and Number of Months so that the retainer is captured correctly.
15. As a salesperson raising an Air Website order, I want to select a package from a predefined list (Brochure Standard, Brochure Advanced, Brochure Pro, Ecommerce) so that the correct fixed hours and costs are applied automatically.
16. As a salesperson, I want the hourly rate to default to £110/hr with the ability to override it so that non-standard rates can be accommodated without extra steps.
17. As a salesperson, I want to see a running total cost calculated from total hours × rate as I fill in the hours matrix so that I have immediate visibility of the order value.
18. As a salesperson, I want to add an invoicing schedule with line items specifying either a month number or an exact date and a percentage so that finance knows the payment structure.
19. As a salesperson, I want the invoicing schedule to validate that all percentages sum to 100% before I can submit so that incomplete schedules are caught immediately.
20. As a salesperson, I want to add line items to the invoicing schedule dynamically (add / remove rows) so that any number of payment milestones can be captured.
21. As a salesperson, I want to enter Additional Ongoing Costs and Additional Outcosts as free-entry fields so that third-party or external costs are included in the order record.
22. As a salesperson, I want to enter a project name/summary, description of requirements, estimated start date, and optional estimated end date so that the order contains full project context.
23. As a salesperson, I want clear form validation with inline error messages so that I know exactly what needs to be corrected before I can proceed.
24. As a salesperson, I want to navigate backwards through the form steps to amend earlier answers without losing later progress so that mistakes are easily corrected.
25. As a salesperson, I want a clear step indicator showing my current position in the form so that I always know how much is left to complete.

### Confirm Screen

26. As a salesperson, I want to see a full read-only summary of everything I've entered before submitting so that I can verify the order is correct.
27. As a salesperson, I want the confirm screen to display the calculated total order value prominently so that the financial impact is clear before submission.
28. As a salesperson, I want to click an "Edit" button on any section of the confirm screen to jump back to that step and make changes so that corrections are quick to make.
29. As a salesperson, I want a clear "Submit Order" call-to-action on the confirm screen so that the submission intent is unambiguous.

### Order Submission & Email

30. As a salesperson, I want the order to be saved to the database immediately on submission so that the record is persisted before any downstream actions occur.
31. As a salesperson, I want an email to be automatically sent to finance@ on submission so that finance is notified without any manual step.
32. As a salesperson, I want the finance email to contain a direct link to the order summary page in the app so that finance can view the full breakdown without accessing Google Sheets.
33. As a salesperson, I want the finance email to be clearly labelled as a "New Sales Order" (or "Amended Sales Order" for edits) so that finance can distinguish new and updated orders.
34. As a salesperson, I want to be redirected to the order summary page after successful submission so that I can immediately see the final record and copy the TSV if needed.
35. As a salesperson, I want a success notification on submission confirming the order was saved and the email was sent so that I have confidence the process completed.

### Orders Dashboard

36. As a salesperson, I want a dashboard listing all past orders so that I can find and review any previous sale.
37. As a salesperson, I want each row on the dashboard to show client name, project name, salesperson, type of requirement, total order value, and submission date so that I can identify orders at a glance.
38. As a salesperson, I want to search orders by client name or project name so that I can quickly find a specific order.
39. As a salesperson, I want to click any order row to open its summary page so that I can view full details.
40. As a salesperson, I want a "New Order" button prominently displayed on the dashboard so that starting a new order is always one click away.

### Order Summary Page

41. As a salesperson, I want the order summary page to display all order details in a clean, readable layout so that the record is easy to review and share.
42. As a salesperson, I want the summary page to show the hours matrix in the same tabular format used in the form so that the breakdown is easy to parse.
43. As a salesperson, I want the summary page to show the invoicing schedule as a clear table so that payment milestones are immediately visible.
44. As a salesperson, I want a "Copy to Clipboard" button that generates a TSV row matching the columns of the projects Google Sheet so that I can paste the record in without retyping any data.
45. As a salesperson, I want an "Edit Order" button on the summary page so that I can correct or update a submitted order.
46. As a finance team member, I want the summary page linked in the email to display without requiring me to log in (or with minimal friction) so that I can view the order details immediately.

### Edit / Amended Order Flow

47. As a salesperson, I want to edit a previously submitted order using the same multi-step form so that the editing experience is consistent with the creation flow.
48. As a salesperson, I want all existing order data to be pre-populated when I open an order for editing so that I only need to change what's different.
49. As a salesperson, I want the confirmation screen for an edit to clearly indicate this is an amendment to an existing order so that I don't confuse it with a new submission.
50. As a salesperson, I want the finance email triggered by an edit to be clearly marked as "Amended Sales Order" and reference the original order so that finance can identify what changed.

---

## Implementation Decisions

### Modules

**1. Database Schema (Prisma + Neon Postgres)**
Manages all persistent data. Core tables:
- `Order` — all order fields including customer info, salesperson, type of requirement, sub-type, rate, additional costs, project details, submission timestamp, amended flag.
- `HoursEntry` — normalised rows linking an order to a role name, optional setup hours, optional monthly hours. Avoids wide nullable columns.
- `InvoiceScheduleItem` — linked to order, stores either a month offset (integer) or an exact date, plus a percentage value.
- Interface: `createOrder`, `getOrder`, `listOrders`, `updateOrder`.

**2. Multi-Step Form**
Implemented as a single page with client-side step management. Steps:
1. Customer Information
2. New Customer Details (conditionally shown)
3. New Customer Account Contact (conditionally shown if accounts contact differs)
4. Sales Information (salesperson, type of requirement, sub-type)
5. Hours Section (dynamically rendered based on type)
6. Rate, Invoicing Schedule, Additional Costs
7. Project Details
8. Confirm Screen

React Hook Form + Zod used for validation. State persisted in memory across steps (no draft persistence to DB).

**3. Hours Matrix Component**
Reusable component with two variants:
- `SingleColumnMatrix` — rows are role names, one "Hours" input per row. Used for Studio Project and Advancement of Existing Website.
- `TwoColumnMatrix` — rows are channel names, "Setup Hours" and "Monthly Hours" inputs per row. Used for Marketing Project and B2B/B2C Lead Gen.
- `BauForm` — simple fields: Studio Hours, Marketing Hours, Number of Months.
- `AirWebsiteForm` — package selector (from constants) that auto-populates hours/cost, plus an editable hours override.

Each variant computes and displays per-row subtotals and an order-level total in real time.

**4. Air Website Constants**
A single exported TypeScript constants file defining each package: name, per-role hour allocations, and total fixed price. Easy to update without touching component logic.

**5. Confirm Screen**
Assembled from read-only summary components that mirror each form step. "Edit" buttons navigate back to the relevant step index. Displays total order value and full invoicing schedule. Submit button triggers server action.

**6. Server Actions**
Next.js Server Actions as the API layer:
- `createOrder(data)` — validates, writes to DB, triggers email, returns order ID.
- `updateOrder(id, data)` — validates, updates DB, triggers amended email, returns order ID.
- `getOrder(id)` — fetches full order with related rows.
- `listOrders(query)` — paginated list with optional search filter.
- `sendFinanceEmail(orderId, isAmended)` — constructs and sends email via email provider.

**7. Email Service**
Resend (or Nodemailer as a fallback) used to send the finance notification email. Email contains: order reference, client name, project name, total value, a link to the summary page, and invoicing schedule summary. CC address stored in environment variable for later configuration. "Amended" emails include a reference to the original submission date.

**8. Orders Dashboard**
Server-rendered page using `listOrders`. Shadcn `Table` component. Client-side search input filters by client name or project name (debounced). "New Order" button in the page header.

**9. Order Summary Page**
Server-rendered at `/orders/[id]`. Full order detail layout. TSV generation is a client-side utility function that maps order fields to the projects sheet column order and writes to clipboard via the Clipboard API. Edit button navigates to `/orders/[id]/edit`.

### Architectural Decisions

- **Next.js App Router** throughout. Server Components for data fetching, Server Actions for mutations.
- **Prisma** as the ORM with Neon Postgres. Connection pooling via Prisma Accelerate or `@prisma/adapter-neon` for serverless compatibility on Vercel.
- **Shadcn/ui** as the component library. All form inputs, tables, dialogs, buttons, and cards use Shadcn primitives.
- **Inter font** via `next/font/google`. Brand primary colour `#2C73D7` defined as a CSS custom property and mapped to Shadcn's primary token.
- **Zod** schemas shared between client validation (React Hook Form) and server-side action validation.
- **No authentication** in phase 1. Google OAuth (restricted to company domain) will be added in a later phase.
- **No draft saving**. Form state is in-memory only; navigating away loses progress.

### UX / Design Decisions

- **Visual hierarchy**: The app uses a two-panel layout on desktop — a narrow left sidebar for navigation/branding, a centred content area for the form. On mobile, the sidebar collapses to a top bar.
- **Step indicator**: A horizontal stepper component at the top of the form shows step names and completion state. Completed steps are clickable to jump back.
- **Hours matrix**: Displayed as a bordered table with alternating row shading. Role names in the left column, hour inputs in subsequent columns, and a read-only "Cost" column (hours × rate) auto-calculated per row. A totals row at the bottom summarises all columns.
- **Rate field**: Displayed adjacent to the hours section as a small inline input with a £ prefix, clearly labelled "Hourly Rate (£/hr)" with the default £110 shown as placeholder.
- **Invoicing schedule**: Rendered as a dynamic table with an "Add Milestone" button. Each row has a toggle to switch between "Month number" and "Exact date" entry, a percentage input, and a remove button. A live percentage total indicator turns green at 100% and red otherwise.
- **Confirm screen layout**: Structured as collapsible summary cards per section (Customer, Sales Info, Hours, Invoicing, Project Details). Each card has an "Edit" link in the top right. Total value is shown in a prominent hero-style callout at the top.
- **Dashboard**: Clean table with subtle hover states. Total value column right-aligned and formatted as currency. Date column shows relative time (e.g. "3 days ago") with full date on hover.
- **Colour usage**: `#2C73D7` used for primary buttons, active step indicators, links, and focus rings. Neutral greys for borders and secondary text. White card backgrounds on a light grey page background.
- **Typography**: Inter throughout. `font-semibold` for section headings, `font-medium` for labels, `font-normal` for input values and body text.
- **Error states**: Inline validation messages below each field in red. Fields with errors receive a red border ring. The step indicator shows a warning indicator on steps containing errors.
- **Empty states**: Dashboard empty state shows a friendly prompt to create the first order with a prominent CTA button.

---

## Testing Decisions

No automated tests are in scope for phase 1.

---

## Out of Scope

- **Google OAuth / authentication** — phase 1 has no auth. Users access the app directly. Google OAuth restricted to company domain will be added in a later phase.
- **Full project management** — the app does not replace the projects Google Sheet. It generates a TSV clipboard copy to assist with manual entry only.
- **Draft saving** — form state is not persisted to the database. Incomplete forms are lost on navigation.
- **Role-based permissions** — all logged-in users (when auth is added) can view and edit all orders.
- **Jira integration** — Jira project links and EVM metrics from the projects sheet are out of scope.
- **Google Sheets write-back** — the app does not write to any Google Sheet directly.
- **Mobile-first responsive design** — the app is desktop-first but should be usable on tablet. Full mobile optimisation is not a priority for phase 1.
- **Quote workflow** — all orders are Sales. Quote support is not planned.
- **Salesperson management** — the salesperson list is hardcoded in a constants file. An admin UI for managing this list is out of scope.

---

## Further Notes

- The Air Website packages (Brochure Standard, Brochure Advanced, Brochure Pro, Ecommerce) and their hour/cost breakdowns are defined in a constants file. The actual values are to be confirmed and filled in before launch.
- The CC email address for the finance notification is to be provided and stored as an environment variable. The `TO` address is `finance@ascensor.co.uk` (to be confirmed).
- The TSV copy for the projects sheet must match the exact column order of the projects Google Sheet. This mapping should be verified against the live sheet before the feature is released.
- The invoicing schedule supports both month-offset (e.g. "Month 2") and exact date (e.g. "2026-08-01") per line item. The distinction is stored as a nullable date field alongside a nullable integer month field on the `InvoiceScheduleItem` model.
- Next.js 16 (used in this project) may have breaking changes from training data. The `node_modules/next/dist/docs/` directory should be consulted before writing any Next.js-specific code, per project conventions.
