import { AdminRole } from "@/features/admin/types/adminTypes"
import {
  Banknote,
  BookOpenCheck,
  Boxes,
  ClipboardList,
  Gauge,
  Layers3,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  roles: AdminRole[]
  comingSoon?: boolean
}
export const allRoles: AdminRole[] = ['super_admin', 'admin_registration', 'admin_payment', 'judge']
export const navigation: NavigationItem[] = [
  { label: 'Ringkasan', href: '/admin/dashboard', icon: Gauge, roles: allRoles },
  { label: 'Verifikasi Tim', href: '/admin/teams', icon: Users, roles: ['super_admin', 'admin_registration', 'admin_payment'] },
  { label: 'Pembayaran', href: '/admin/payments', icon: Banknote, roles: ['super_admin', 'admin_payment'],},
  { label: 'Kompetisi', href: '/admin/competitions', icon: Layers3, roles: allRoles },
  { label: 'Batch', href: '/admin/batches', icon: Boxes, roles: allRoles },
  { label: 'Tahapan', href: '/admin/stages', icon: ClipboardList, roles: ['super_admin', 'admin_registration'], comingSoon: true },
  { label: 'Buat Soal', href: '/admin/questions', icon: BookOpenCheck, roles: ['super_admin', 'judge'] },
  { label: 'Penilaian', href: '/admin/judging', icon: BookOpenCheck, roles: ['super_admin', 'judge'], comingSoon: true },
]

export const adminRoleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin_registration: 'Admin Registrasi',
  admin_payment: 'Admin Pembayaran',
  judge: 'Juri',
}
