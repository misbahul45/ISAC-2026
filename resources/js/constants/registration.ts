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
      "Kompetisi akademik yang menguji kemampuan peserta dalam menyelesaikan soal-soal sesuai bidang yang dilombakan.",
  },
  {
    id: "BUSINESS_PLAN",
    name: "BUSINESS PLAN",
    description:
      "Kompetisi penyusunan proposal bisnis inovatif yang berfokus pada solusi, kelayakan, dan keberlanjutan usaha.",
  },
  {
    id: "BUSINESS_IT_CASE",
    name: "BUSINESS IT CASE",
    description:
      "Kompetisi analisis dan pemecahan studi kasus bisnis berbasis teknologi informasi dengan solusi yang aplikatif.",
  },
] as const;