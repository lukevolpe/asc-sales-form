export const SINGLE_COLUMN_ROLES = [
  'Design',
  'UX',
  'Frontend',
  'Backend',
  'Testing',
  'Solutions',
  'Hosting',
  'Deployments',
  'Project Management',
] as const;

export type SingleColumnRole = (typeof SINGLE_COLUMN_ROLES)[number];

export type AirPackageHours = Record<SingleColumnRole, number>;

// Testing and Project Management are derived in the UI (see AirWebsiteForm).
// The values here are fallback seeds only — the form overwrites them via formula.
export const AIR_WEBSITE_PACKAGES: Record<string, AirPackageHours> = {
  'Brochure Standard': {
    Design: 20,
    UX: 10,
    Frontend: 30,
    Backend: 10,
    Testing: 8,
    Solutions: 5,
    Hosting: 5,
    Deployments: 5,
    'Project Management': 19,
  },
  'Brochure Advanced': {
    Design: 30,
    UX: 15,
    Frontend: 45,
    Backend: 20,
    Testing: 13,
    Solutions: 10,
    Hosting: 5,
    Deployments: 10,
    'Project Management': 30,
  },
  'Brochure Pro': {
    Design: 40,
    UX: 25,
    Frontend: 60,
    Backend: 30,
    Testing: 18,
    Solutions: 15,
    Hosting: 5,
    Deployments: 10,
    'Project Management': 41,
  },
  Ecommerce: {
    Design: 60,
    UX: 40,
    Frontend: 100,
    Backend: 80,
    Testing: 36,
    Solutions: 20,
    Hosting: 10,
    Deployments: 15,
    'Project Management': 72,
  },
};

export const TWO_COLUMN_CHANNELS = [
  'Social Media',
  'Paid Search',
  'Display Advertising',
  'Email',
  'Content Marketing',
] as const;
