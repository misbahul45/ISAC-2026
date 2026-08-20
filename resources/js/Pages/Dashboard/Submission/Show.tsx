import { Link } from '@inertiajs/react'
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Construction,
  FileCheck2,
  LockKeyhole,
  TimerReset,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'
import { DashboardBackdrop } from '@/features/dashboard/components/DashboardBackdrop'
import { DashboardError, DashboardLoading } from '@/features/dashboard/components/DashboardStates'
import { useSubmissionShell } from '@/features/dashboard/hooks/useDashboard'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const paymentCopy = {
  PAYMENT_REQUIRED: {
    title: 'Pembayaran diperlukan',
    description: 'Tahap ini tetap terkunci sampai bukti pembayaran diverifikasi oleh panitia.',
    Icon: LockKeyhole,
  },
  WAITING_VERIFICATION: {
    title: 'Pembayaran sedang diverifikasi',
    description: 'Bukti sudah diterima. Panitia sedang memeriksa pembayaran sebelum membuka tahap ini.',
    Icon: TimerReset,
  },
  REVISION_REQUIRED: {
    title: 'Perbaiki bukti pembayaran',
    description: 'Panitia meminta revisi pada bukti pembayaran yang dikirim.',
    Icon: CircleAlert,
  },
  NOT_REQUIRED: {
    title: 'Pengumpulan tersedia',
    description: 'Team telah memiliki akses ke tahap ini.',
    Icon: FileCheck2,
  },
} as const

export default function SubmissionShell({ stageId }: { stageId: string }) {
  const query = useSubmissionShell(stageId)
  const data = query.data?.data

  if (query.isLoading) return <DashboardLoading />
  if (query.error || !data) {
    return <DashboardError message={query.error?.message ?? 'Tahap pengumpulan tidak tersedia untuk Team ini.'} retry={() => query.refetch()} />
  }

  const state = paymentCopy[data.payment.state]
  const StateIcon = state.Icon

  return (
    <main className="error-portal-shell relative min-h-screen overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Seo title={`${data.stage.name} — Pengumpulan`} description="Tahap pengumpulan karya ISAC 2026." canonical={`/dashboard/submission/${stageId}`} noindex />
      <DashboardBackdrop />
      <div className="relative z-20 mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), 'backdrop-blur-xl')}><ArrowLeft />Kembali ke Dashboard</Link>

        <section className="error-portal-card relative">
          <span aria-hidden="true" className="error-border-portal" />
          <span aria-hidden="true" className="error-border-comet" />
          <span aria-hidden="true" className="error-border-pulse" />
          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-card/55 p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-9">
            <span aria-hidden="true" className="error-scanline" />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div><Badge variant="outline">{data.competition.name}</Badge><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{data.stage.name}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{data.stage.description ?? `Aktivitas untuk tahap ${data.stage.name}.`}</p></div>
              <Badge className="shrink-0 bg-secondary/15 text-secondary">{data.competition.type.replace(/_/g, ' ')}</Badge>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-secondary" />{formatDate(data.stage.startDate, { dateStyle: 'medium' })} – {formatDate(data.stage.endDate, { dateStyle: 'medium' })}</span><span aria-hidden="true">•</span><span>{data.batch.name}</span></div>
          </div>
        </section>

        <Card className={cn('border bg-card/50 backdrop-blur-xl', data.submissionLocked ? 'border-secondary/25' : 'border-accent/25')}>
          <CardHeader><div className="flex items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background/40"><StateIcon className="size-5 text-secondary" /></div><div><CardTitle className="text-xl font-bold">{state.title}</CardTitle><p className="mt-2 text-sm leading-6 text-muted-foreground">{state.description}</p></div></div></CardHeader>
          <CardContent className="space-y-5">
            {data.payment.isTargetStage && (
              <div className="rounded-3xl border border-white/10 bg-background/30 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Biaya sesuai Batch registrasi</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><p className="font-semibold">{data.batch.name}</p><p className="mt-1 text-sm text-muted-foreground">Harga tidak mengikuti Batch aktif terbaru.</p></div><p className="text-2xl font-bold text-secondary">{formatCurrency(data.payment.originalAmount)}</p></div>
              </div>
            )}
            {data.payment.rejectionReason && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><p className="font-semibold">Catatan panitia</p><p className="mt-1">{data.payment.rejectionReason}</p></div>}
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-white/15 p-4 text-sm leading-6 text-muted-foreground"><Construction className="mt-0.5 size-5 shrink-0" /><p>{data.submissionLocked ? 'Upload bukti pembayaran pada checkpoint dan form submission belum dibangun dalam scope ini. Route, state, harga Batch, dan authorization sudah disiapkan.' : 'Uploader submission belum dibangun dalam scope ini. Halaman ini adalah shell terotorisasi untuk engine pengumpulan berikutnya.'}</p></div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
