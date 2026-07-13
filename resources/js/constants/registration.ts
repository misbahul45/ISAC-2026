import {
  Trophy,
  Users,
  User,
  FileText,
  CreditCard,
} from "lucide-react";

export const REGISTRATION_STEPS = [
  {
    id: "competition",
    name: "Competition",
    icon: Trophy,
  },
  {
    id: "team",
    name: "Team",
    icon: Users,
  },
  {
    id: "biodata",
    name: "Biodata",
    icon: User,
  },
  {
    id: "documents",
    name: "Documents",
    icon: FileText,
  },
  {
    id: "payment",
    name: "Payment",
    icon: CreditCard,
  },
] as const;


export const COMPETITIONS = [
  {
    id: "OLIMPIADE",
    name: "OLIMPIADE",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: "BUSINESS_PLAN",
    name: "BUSINESS PLAN",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: "BUSINESS_IT_CASE",
    name: "BUSINESS IT CASE",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
] as const;