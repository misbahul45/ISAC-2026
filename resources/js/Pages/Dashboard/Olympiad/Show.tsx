import { Link } from '@inertiajs/react'
import { ArrowLeft, CalendarDays, Clock3, Construction, ShieldCheck, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'
import { DashboardBackdrop } from '@/features/dashboard/components/DashboardBackdrop'
import { DashboardError, DashboardLoading } from '@/features/dashboard/components/DashboardStates'
import { useExamShell } from '@/features/dashboard/hooks/useDashboard'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export default function OlympiadExamShell({ examId }: { examId: string }) {
  const query = useExamShell(examId)
  const data = query.data?.data

  if (query.isLoading) return <DashboardLoading />
  if (query.error || !data) {
    return <DashboardError message={query.error?.message ?? 'Ujian tidak tersedia untuk Team ini.'} retry={() => query.refetch()} />
  }

  return (
    <main className="error-portal-shell relative min-h-screen overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Seo title={`${data.exam.title} — Olimpiade`} description="Detail ujian Olimpiade ISAC 2026." canonical={`/dashboard/olimpiade/${examId}`} noindex />
      <DashboardBackdrop />
      <div className="relative z-20 mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), 'backdrop-blur-xl')}><ArrowLeft />Kembali ke Dashboard</Link>

        <section className="error-portal-card relative">
          <span aria-hidden="true" className="error-border-portal" />
          <span aria-hidden="true" className="error-border-comet" />
          <span aria-hidden="true" className="error-border-pulse" />
          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-card/55 p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-9">
            <span aria-hidden="true" className="error-scanline" />
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-primary"><Trophy className="size-6" /></div>
                <div><Badge variant="outline">{data.stage.name}</Badge><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{data.exam.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{data.exam.description ?? 'Detail pelaksanaan ujian akan diumumkan oleh panitia.'}</p></div>
              </div>
              <Badge className="shrink-0 bg-secondary/15 text-secondary">Shell Ujian</Badge>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-background/30 p-4"><p className="text-xs text-muted-foreground">Mulai</p><p className="mt-2 text-sm font-medium">{formatDate(data.exam.startDate, { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
              <div className="rounded-2xl border border-white/10 bg-background/30 p-4"><p className="text-xs text-muted-foreground">Selesai</p><p className="mt-2 text-sm font-medium">{formatDate(data.exam.endDate, { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
              <div className="rounded-2xl border border-white/10 bg-background/30 p-4"><p className="text-xs text-muted-foreground">Durasi</p><p className="mt-2 text-sm font-medium">{data.exam.duration} menit</p></div>
              <div className="rounded-2xl border border-white/10 bg-background/30 p-4"><p className="text-xs text-muted-foreground">Percobaan</p><p className="mt-2 text-sm font-medium">Maks. {data.exam.maxAttempts}</p></div>
            </div>
          </div>
        </section>

        <Card className="border border-white/10 bg-card/50 backdrop-blur-xl">
          <CardHeader><CardTitle className="flex items-center gap-3"><Construction className="size-5 text-secondary" />Exam Engine belum diaktifkan</CardTitle></CardHeader>
          <CardContent className="space-y-5 text-sm leading-6 text-muted-foreground">
            <p>Halaman ini sudah memakai ID Exam actual dan telah diverifikasi terhadap current Stage Team. Question UI, timer, attempt, autosave, anti-cheat, dan submit belum diimplementasikan pada scope ini.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-background/30 p-3"><CalendarDays className="size-4 text-primary" />Jadwal backend</div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-background/30 p-3"><Clock3 className="size-4 text-primary" />Durasi backend</div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-background/30 p-3"><ShieldCheck className="size-4 text-primary" />Akses terotorisasi</div>
            </div>
            <p className="text-xs">{data.competition.name} · {data.batch.name} · {formatCurrency(data.batch.price)}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
