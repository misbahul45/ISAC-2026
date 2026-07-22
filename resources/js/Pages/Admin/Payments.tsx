import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminPlaceholderPage } from '@/features/admin/components/AdminPlaceholderPage'

export default function AdminPayments() {
  return <AdminPlaceholderPage title="Verifikasi Pembayaran" description="Endpoint aksi pembayaran sudah tersedia, tetapi antrean dan detail bukti pembayaran belum memiliki endpoint read-only yang aman untuk UI." endpoint="GET /api/admin/payments" canonical="/admin/payments" />
}

AdminPayments.layout = adminPageLayout

