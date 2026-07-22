import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminPlaceholderPage } from '@/features/admin/components/AdminPlaceholderPage'

export default function AdminStages() {
  return <AdminPlaceholderPage title="Tahapan Kompetisi" description="Perpindahan tahap sudah memiliki endpoint aksi, tetapi daftar stage dan next-stage yang valid belum tersedia untuk membangun kontrol UI yang aman." endpoint="GET /api/admin/stages" canonical="/admin/stages" />
}

AdminStages.layout = adminPageLayout

