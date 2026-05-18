import { SINGLE_COLUMN_ROLES, TWO_COLUMN_CHANNELS } from '@/lib/constants/airWebsitePackages'

export const REQUIREMENT_TYPES = [
  'Air Website',
  'Studio Project',
  'Marketing Project',
  'B2B/B2C Lead Gen',
  'Advancement of Existing Website',
  'BAU Retainer',
] as const

export type RequirementType = (typeof REQUIREMENT_TYPES)[number]

export const REQUIREMENT_SUB_TYPES = ['Website', 'Application', 'Software'] as const

export const SUB_TYPE_REQUIRED_FOR: readonly string[] = [
  'Studio Project',
  'Advancement of Existing Website',
]

export function requiresSubType(type: string): boolean {
  return SUB_TYPE_REQUIRED_FOR.includes(type)
}

type HoursEntryDefault = {
  roleName: string
  hours?: number
  setupHours?: number
  monthlyHours?: number
  months?: number
}

export function getDefaultHoursEntries(requirementType: string): HoursEntryDefault[] {
  switch (requirementType) {
    case 'Studio Project':
    case 'Advancement of Existing Website':
    case 'Air Website':
      return SINGLE_COLUMN_ROLES.map((role) => ({ roleName: role, hours: 0 }))
    case 'Marketing Project':
    case 'B2B/B2C Lead Gen':
      return TWO_COLUMN_CHANNELS.map((ch) => ({ roleName: ch, setupHours: 0, monthlyHours: 0 }))
    case 'BAU Retainer':
      return [
        { roleName: 'Studio', monthlyHours: 0, months: 1 },
        { roleName: 'Marketing', monthlyHours: 0, months: 1 },
      ]
    default:
      return []
  }
}
