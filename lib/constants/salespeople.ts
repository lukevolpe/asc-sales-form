export const SALESPEOPLE = [
  'Andrew Firth',
  'Olivia Johnson',
  'Tiff Hurst',
  'Luke Volpe',
] as const;

export type Salesperson = (typeof SALESPEOPLE)[number];
