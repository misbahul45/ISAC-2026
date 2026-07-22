import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminPlaceholderPage } from '@/features/admin/components/AdminPlaceholderPage'

export default function AdminAuditLogs() {
  return <AdminPlaceholderPage title="Audit Aktivitas" description="Riwayat mutation admin sudah dicatat pada database, tetapi endpoint read-only dengan pagination dan filter belum tersedia." endpoint="GET /api/admin/audit-logs" canonical="/admin/audit-logs" />
}

AdminAuditLogs.layout = adminPageLayout

