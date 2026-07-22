import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminPlaceholderPage } from '@/features/admin/components/AdminPlaceholderPage'

export default function AdminJudging() {
  return <AdminPlaceholderPage title="Penilaian" description="Modul penilaian submission dan ujian akan diaktifkan setelah endpoint daftar tugas, rubrik, dan penyimpanan nilai tersedia." endpoint="GET /api/admin/judging/assignments" canonical="/admin/judging" />
}

AdminJudging.layout = adminPageLayout
