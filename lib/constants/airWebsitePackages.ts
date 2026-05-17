export const SINGLE_COLUMN_ROLES = [
  "Design",
  "UX",
  "Frontend",
  "Backend",
  "Solutions",
  "Hosting",
  "Deployment",
] as const

export type SingleColumnRole = (typeof SINGLE_COLUMN_ROLES)[number]

export type AirPackageHours = Record<SingleColumnRole, number>

export const AIR_WEBSITE_PACKAGES: Record<string, AirPackageHours> = {
  "Brochure Standard": {
    Design: 20,
    UX: 10,
    Frontend: 30,
    Backend: 10,
    Solutions: 5,
    Hosting: 5,
    Deployment: 5,
  },
  "Brochure Advanced": {
    Design: 30,
    UX: 15,
    Frontend: 45,
    Backend: 20,
    Solutions: 10,
    Hosting: 5,
    Deployment: 10,
  },
  "Brochure Pro": {
    Design: 40,
    UX: 25,
    Frontend: 60,
    Backend: 30,
    Solutions: 15,
    Hosting: 5,
    Deployment: 10,
  },
  Ecommerce: {
    Design: 60,
    UX: 40,
    Frontend: 100,
    Backend: 80,
    Solutions: 20,
    Hosting: 10,
    Deployment: 15,
  },
}

export const TWO_COLUMN_CHANNELS = [
  "Social Media",
  "Paid Search",
  "Display Advertising",
  "Email",
  "Content Marketing",
] as const
