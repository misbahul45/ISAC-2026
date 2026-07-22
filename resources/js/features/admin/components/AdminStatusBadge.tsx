import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const tones: Record<string, string> = {
  VERIFIED: 'border-accent/25 bg-accent/10 text-accent',
  COMPLETED: 'border-accent/25 bg-accent/10 text-accent',
  OPEN: 'border-accent/25 bg-accent/10 text-accent',
  REGISTRATION_OPEN: 'border-accent/25 bg-accent/10 text-accent',
  WAITING_VERIFICATION: 'border-secondary/25 bg-secondary/10 text-secondary',
  WAITING_PAYMENT: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  REVISION_REQUIRED: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  REJECTED: 'border-destructive/25 bg-destructive/10 text-destructive',
  CANCELLED: 'border-destructive/25 bg-destructive/10 text-destructive',
  CLOSED: 'border-muted-foreground/25 bg-muted text-muted-foreground',
  FULL: 'border-muted-foreground/25 bg-muted text-muted-foreground',
  DRAFT: 'border-primary/25 bg-primary/10 text-primary',
  INCOMPLETE: 'border-muted-foreground/25 bg-muted text-muted-foreground',
}

const labels: Record<string, string> = {
  VERIFIED: 'Terverifikasi',
  COMPLETED: 'Selesai',
  OPEN: 'Dibuka',
  REGISTRATION_OPEN: 'Pendaftaran Dibuka',
  REGISTRATION_CLOSED: 'Pendaftaran Ditutup',
  ONGOING: 'Berlangsung',
  WAITING_VERIFICATION: 'Menunggu Verifikasi',
  WAITING_PAYMENT: 'Menunggu Pembayaran',
  REVISION_REQUIRED: 'Perlu Revisi',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
  CLOSED: 'Ditutup',
  FULL: 'Penuh',
  DRAFT: 'Draft',
  INCOMPLETE: 'Belum Lengkap',
}

export function AdminStatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={cn('font-medium', tones[status])}>{labels[status] ?? status.replace(/_/g, ' ')}</Badge>
}
