import { Trophy, Users, User, FileText, CreditCard, ShieldCheck } from 'lucide-react'

const BASE_REGISTRATION_STEPS = [
  {
    id: 'competition',
    name: 'Competition',
    icon: Trophy,
  },
  {
    id: 'team',
    name: 'Team',
    icon: Users,
  },
  {
    id: 'biodata',
    name: 'Biodata',
    icon: User,
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: FileText,
  },
] as const

export const getRegistrationSteps = (isOlympiad: boolean) => [
  ...BASE_REGISTRATION_STEPS,
  isOlympiad
    ? {
        id: 'payment',
        name: 'Payment',
        icon: CreditCard,
      }
    : {
        id: 'validation',
        name: 'Validation',
        icon: ShieldCheck,
      },
] as const
