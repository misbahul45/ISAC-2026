import { Link, router } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  LockKeyhole,
  Sparkles,
  TimerReset,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { DashboardBackdrop } from '@/features/dashboard/components/DashboardBackdrop'
import { DashboardError, DashboardLoading } from '@/features/dashboard/components/DashboardStates'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type { DashboardExam } from '@/features/dashboard/types/dashboardTypes'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

type ExamState = 'AVAILABLE' | 'UPCOMING' | 'ENDED' | 'LOCKED'

const examStateCopy: Record<ExamState, string> = {
  AVAILABLE: 'Tersedia',
  UPCOMING: 'Akan datang',
  ENDED: 'Berakhir',
  LOCKED: 'Terkunci',
}

function getExamState(exam: DashboardExam): ExamState {
  const start = exam.startDate ? new Date(exam.startDate).getTime() : Number.NaN
  const end = exam.endDate ? new Date(exam.endDate).getTime() : Number.NaN
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'LOCKED'
  const now = Date.now()
  if (now < start) return 'UPCOMING'
  if (now > end) return 'ENDED'
  return 'AVAILABLE'
}

function ExamCard({ exam }: { exam: DashboardExam }) {
  const state = getExamState(exam)
  const actionLabel = state === 'AVAILABLE' ? 'Buka Ujian' : 'Lihat Detail'

  return (
    <Card className="border border-white/10 bg-card/55 shadow-xl shadow-black/20 backdrop-blur-xl">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary">
            <Trophy className="size-5" />
          </div>
          <Badge variant={state === 'AVAILABLE' ? 'default' : 'outline'}>{examStateCopy[state]}</Badge>
        </div>
        <div>
          <CardTitle className="text-xl font-bold">{exam.title}</CardTitle>
          {exam.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{exam.description}</p>}
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-5">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4 text-secondary" />{formatDate(exam.startDate, { dateStyle: 'medium', timeStyle: 'short' })}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Clock3 className="size-4 text-secondary" />{exam.duration} menit · Maks. {exam.maxAttempts} percobaan</div>
        </div>
        <Link
          href={`/dashboard/olimpiade/${exam.id}`}
          className={cn(buttonVariants({ size: 'lg' }), 'w-full justify-between')}
        >
          {actionLabel}<ArrowRight />
        </Link>
      </CardContent>
    </Card>
  )
}

export default function DashboardIndex() {
  const { principal, isAuthenticated, isLoading } = useAuthSession()
  const { summary, summaryQuery } = useDashboard()
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.visit('/auth/login', { replace: true })
    else if (principal?.principalType === 'ADMIN') router.visit('/admin/dashboard', { replace: true })
  }, [isAuthenticated, isLoading, principal])

  useEffect(() => {
    if (summary && summary.currentStep !== 'DASHBOARD') {
      router.visit(summary.redirectTo, { replace: true })
    }
  }, [summary])

  useEffect(() => {
    const payment = summary?.payment
    const registrationId = summary?.registration?.id
    if (!payment?.verifiedAt || !payment.proof || !registrationId) {
      setShowPaymentSuccess(false)
      return
    }

    const storageKey = `isac:payment-verified:${registrationId}:${payment.verifiedAt}`
    setShowPaymentSuccess(window.localStorage.getItem(storageKey) !== 'dismissed')
  }, [summary])

  const dismissPaymentSuccess = () => {
    const payment = summary?.payment
    const registrationId = summary?.registration?.id
    if (payment?.verifiedAt && registrationId) {
      window.localStorage.setItem(`isac:payment-verified:${registrationId}:${payment.verifiedAt}`, 'dismissed')
    }
    setShowPaymentSuccess(false)
  }

  const businessActivity = useMemo(() => {
    if (!summary?.registration || summary.registration.competition.type === 'OLIMPIADE') return null
    const paymentStage = summary.registration.paymentForStage
    const stage = paymentStage ?? summary.team.currentStage
    if (!stage) return null

    const isPaymentTarget = paymentStage !== null
    const registrationStatus = summary.registration.status
    const state = !isPaymentTarget
      ? 'AVAILABLE'
      : registrationStatus === 'WAITING_VERIFICATION'
        ? 'PAYMENT_REVIEW'
        : registrationStatus === 'REVISION_REQUIRED'
          ? 'PAYMENT_REQUIRED'
          : 'PAYMENT_REQUIRED'

    return { stage, state, isPaymentTarget }
  }, [summary])

  if (summaryQuery.isLoading) return <DashboardLoading />
  if (summaryQuery.error || !summary) {
    return <DashboardError message={summaryQuery.error?.message ?? 'Data dashboard tidak tersedia.'} retry={() => summaryQuery.refetch()} />
  }
  if (summary.currentStep !== 'DASHBOARD') return <DashboardLoading />

  const competition = summary.registration?.competition
  const batch = summary.registration?.batch
  const currentStage = summary.team.currentStage
  const isOlympiad = competition?.type === 'OLIMPIADE'
  const hasVerifiedProof = Boolean(summary.payment?.verifiedAt && summary.payment.proof)

  return (
    <main className="error-portal-shell relative min-h-screen overflow-hidden px-4 pb-24 pt-28 text-foreground sm:px-6 sm:pt-32">
      <Seo title="Dashboard Team" description="Aktivitas dan tahap kompetisi Team ISAC 2026." canonical="/dashboard" noindex />
      <DashboardBackdrop />

      <div className="relative z-20 mx-auto max-w-6xl space-y-8">
        <section className="error-portal-card relative">
          <span aria-hidden="true" className="error-border-portal" />
          <span aria-hidden="true" className="error-border-comet" />
          <span aria-hidden="true" className="error-border-pulse" />
          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-card/50 p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-9">
            <span aria-hidden="true" className="error-scanline" />
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Badge className="bg-secondary/15 text-secondary">Team Dashboard</Badge>
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{summary.team.code}</span>
                </div>
                <p className="text-sm font-medium text-secondary">Halo, {summary.team.name ?? summary.team.code}</p>
                <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{competition?.name ?? 'Kompetisi ISAC 2026'}</h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{batch?.name ?? 'Batch belum tersedia'}</span>
                  {batch && <span aria-hidden="true">•</span>}
                  {batch && <span>{formatCurrency(batch.price)}</span>}
                  {competition && <span aria-hidden="true">•</span>}
                  {competition && <span>Pembayaran {competition.paymentFlow === 'UPFRONT' ? 'saat registrasi' : 'saat lolos Semifinal'}</span>}
                </div>
              </div>

              <div className="w-full rounded-3xl border border-secondary/20 bg-background/35 p-5 lg:w-72">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary"><Sparkles className="size-5" /></div>
                  <div className="min-w-0"><p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Tahap saat ini</p><p className="mt-1 truncate font-semibold">{currentStage?.name ?? 'Menunggu aktivasi'}</p></div>
                </div>
                {currentStage?.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{currentStage.description}</p>}
              </div>
            </div>
          </div>
        </section>

        {showPaymentSuccess && summary.payment?.proof && (
          <section className="relative rounded-[2rem] border border-accent/30 bg-accent/10 p-5 shadow-xl shadow-accent/5 backdrop-blur-xl sm:p-6" aria-live="polite">
            <Button variant="ghost" size="icon-sm" className="absolute right-4 top-4" onClick={dismissPaymentSuccess} aria-label="Tutup pemberitahuan pembayaran"><X /></Button>
            <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3"><CheckCircle2 className="mt-0.5 size-6 shrink-0 text-accent" /><div><h2 className="font-bold text-accent">Pembayaran telah diverifikasi</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Pemberitahuan ini hanya tampil sekali. Bukti pembayaran tetap dapat diunduh dari kartu pembayaran.</p></div></div>
              <a href={summary.payment.proof.url} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'outline' }), 'shrink-0')}><Download />Unduh Bukti</a>
            </div>
          </section>
        )}

        {summary.payment?.submittedAt && !summary.payment.verifiedAt && summary.payment.proof && (
          <section className="rounded-[2rem] border border-secondary/25 bg-secondary/10 p-5 backdrop-blur-xl sm:p-6" aria-live="polite">
            <div className="flex gap-3"><TimerReset className="mt-0.5 size-6 shrink-0 text-secondary" /><div><h2 className="font-bold text-secondary">Pembayaran sedang diverifikasi</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Panitia sedang memeriksa bukti pembayaran. Aktivitas yang memerlukan pembayaran tetap terkunci sampai verifikasi selesai.</p></div></div>
          </section>
        )}

        <section aria-labelledby="activity-heading" className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold text-secondary">Langkah berikutnya</p><h2 id="activity-heading" className="mt-1 text-2xl font-bold sm:text-3xl">Aktivitas Kamu</h2></div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">Aktivitas diambil dari tahap Team yang aktif, bukan dari seluruh tahap Competition.</p>
          </div>

          {isOlympiad && summary.activities.exams.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">{summary.activities.exams.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div>
          )}

          {!isOlympiad && businessActivity && (
            <Card className="border border-white/10 bg-card/55 shadow-xl shadow-black/20 backdrop-blur-xl">
              <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-secondary/25 bg-secondary/15 text-secondary">
                    {businessActivity.isPaymentTarget ? <LockKeyhole className="size-5" /> : <FileCheck2 className="size-5" />}
                  </div>
                  <div><CardTitle className="text-xl font-bold">{businessActivity.isPaymentTarget ? businessActivity.stage.name : `Pengumpulan Tahap ${businessActivity.stage.name}`}</CardTitle><p className="mt-2 text-sm leading-6 text-muted-foreground">{businessActivity.isPaymentTarget ? businessActivity.state === 'PAYMENT_REVIEW' ? 'Pembayaran sedang diverifikasi untuk melanjutkan ke tahap ini.' : 'Pembayaran diperlukan untuk melanjutkan ke tahap ini.' : businessActivity.stage.description ?? `Kumpulkan karya untuk tahap ${businessActivity.stage.name}.`}</p></div>
                </div>
                <Badge variant={businessActivity.isPaymentTarget ? 'outline' : 'default'}>{businessActivity.state === 'PAYMENT_REVIEW' ? 'Payment Review' : businessActivity.isPaymentTarget ? 'Payment Required' : 'Tersedia'}</Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div><p className="text-xs text-muted-foreground">Tahap</p><p className="mt-1 font-medium">{businessActivity.stage.name}</p></div>
                  <div><p className="text-xs text-muted-foreground">Periode</p><p className="mt-1">{formatDate(businessActivity.stage.startDate, { dateStyle: 'medium' })} – {formatDate(businessActivity.stage.endDate, { dateStyle: 'medium' })}</p></div>
                  {businessActivity.isPaymentTarget && <div><p className="text-xs text-muted-foreground">Batch & biaya</p><p className="mt-1 font-medium">{batch?.name} · {formatCurrency(batch?.price)}</p></div>}
                </div>
                <Link href={`/dashboard/submission/${businessActivity.stage.id}`} className={cn(buttonVariants({ size: 'lg' }), 'w-full justify-between sm:w-auto')}>Buka Tahap<ArrowRight /></Link>
              </CardContent>
            </Card>
          )}

          {((isOlympiad && summary.activities.exams.length === 0) || (!isOlympiad && !businessActivity)) && (
            <Card className="border border-dashed border-white/15 bg-card/35 backdrop-blur-xl"><CardContent className="flex flex-col items-center px-6 py-12 text-center"><Clock3 className="size-9 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Belum ada aktivitas aktif</h3><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Panitia akan menampilkan ujian atau tahap pengumpulan setelah Team diaktifkan pada stage yang sesuai.</p></CardContent></Card>
          )}
        </section>

        <section className="grid gap-5 md:grid-cols-3" aria-label="Ringkasan Team">
          <Card className="border border-white/10 bg-card/45 backdrop-blur-xl"><CardContent className="flex items-center gap-3 pt-6"><Users className="size-5 text-secondary" /><div><p className="text-xs text-muted-foreground">Jumlah peserta</p><p className="mt-1 text-xl font-bold">{summary.team.memberCount}</p></div></CardContent></Card>
          <Card className="border border-white/10 bg-card/45 backdrop-blur-xl"><CardContent className="flex items-center gap-3 pt-6"><FileText className="size-5 text-primary" /><div className="min-w-0"><p className="text-xs text-muted-foreground">Status Team</p><p className="mt-1 truncate font-semibold">{summary.team.status.replace(/_/g, ' ')}</p></div></CardContent></Card>
          <Card className="border border-white/10 bg-card/45 backdrop-blur-xl"><CardContent className="flex items-center justify-between gap-3 pt-6"><div className="flex min-w-0 items-center gap-3"><FileCheck2 className="size-5 shrink-0 text-accent" /><div className="min-w-0"><p className="text-xs text-muted-foreground">Pembayaran</p><p className="mt-1 truncate font-semibold">{hasVerifiedProof ? 'Terverifikasi' : summary.payment?.submittedAt ? 'Dalam review' : competition?.paymentFlow === 'SEMIFINAL' ? 'Saat Semifinal' : 'Belum dikirim'}</p></div></div>{hasVerifiedProof && summary.payment?.proof && <a href={summary.payment.proof.url} target="_blank" rel="noreferrer" aria-label="Unduh bukti pembayaran" className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'shrink-0')}><Download /></a>}</CardContent></Card>
        </section>
      </div>
    </main>
  )
}
