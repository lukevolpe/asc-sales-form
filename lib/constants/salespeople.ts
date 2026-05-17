export const SALESPEOPLE = [
  "Alice Johnson",
  "Ben Carter",
  "Chris Davies",
  "Diana Patel",
  "Ed Williams",
] as const

export type Salesperson = (typeof SALESPEOPLE)[number]
