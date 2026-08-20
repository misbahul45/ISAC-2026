import { Link } from '@inertiajs/react'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hourglass,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'
import { DashboardBackdrop } from '@/features/dashboard/components/DashboardBackdrop'
import {
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/DashboardStates'
import { useExamShell } from '@/features/dashboard/hooks/useDashboard'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

type ExamStatus = 'UPCOMING' | 'AVAILABLE' | 'ENDED'

function getExamStatus(
  startDate: string,
  endDate: string,
): ExamStatus {
  const now = Date.now()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  if (now < start) {
    return 'UPCOMING'
  }

  if (now > end) {
    return 'ENDED'
  }

  return 'AVAILABLE'
}

const examStatusCopy = {
  UPCOMING: {
    label: 'Belum Dimulai',
    title: 'Menunggu waktu pelaksanaan',
    description:
      'Ujian belum dapat diakses. Silakan kembali pada waktu mulai yang telah ditentukan dan pastikan Team sudah siap sebelum ujian berlangsung.',
    Icon: Hourglass,
  },
  AVAILABLE: {
    label: 'Sedang Berlangsung',
    title: 'Ujian sedang berlangsung',
    description:
      'Periode ujian sudah dimulai. Pastikan koneksi internet stabil dan selesaikan ujian dalam durasi serta batas percobaan yang tersedia.',
    Icon: Clock3,
  },
  ENDED: {
    label: 'Selesai',
    title: 'Periode ujian telah berakhir',
    description:
      'Waktu pelaksanaan ujian telah selesai. Informasi hasil atau tahap berikutnya akan disampaikan oleh panitia melalui dashboard.',
    Icon: CheckCircle2,
  },
} as const

export default function OlympiadExamShell({
  examId,
}: {
  examId: string
}) {
  const query = useExamShell(examId)
  const data = query.data?.data

  if (query.isLoading) {
    return <DashboardLoading />
  }

  if (query.error || !data) {
    return (
      <DashboardError
        message={
          query.error?.message ??
          'Ujian tidak tersedia untuk Team ini.'
        }
        retry={() => query.refetch()}
      />
    )
  }

  const examStatus = getExamStatus(
    data.exam.startDate,
    data.exam.endDate,
  )

  const status = examStatusCopy[examStatus]
  const StatusIcon = status.Icon

  return (
    <main className="error-portal-shell relative min-h-screen overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
      <Seo
        title={`${data.exam.title} — Olimpiade`}
        description="Detail ujian Olimpiade ISAC 2026."
        canonical={`/dashboard/olimpiade/${examId}`}
        noindex
      />

      <DashboardBackdrop />

      <div className="relative z-20 mx-auto max-w-4xl space-y-6">
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({
              variant: 'outline',
            }),
            'backdrop-blur-xl',
          )}
        >
          <ArrowLeft />
          Kembali ke Dashboard
        </Link>

        <section className="error-portal-card relative">
          <span
            aria-hidden="true"
            className="error-border-portal"
          />

          <span
            aria-hidden="true"
            className="error-border-comet"
          />

          <span
            aria-hidden="true"
            className="error-border-pulse"
          />

          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-card/55 p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-9">
            <span
              aria-hidden="true"
              className="error-scanline"
            />

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-primary">
                  <Trophy className="size-6" />
                </div>

                <div>
                  <Badge variant="outline">
                    {data.stage.name}
                  </Badge>

                  <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    {data.exam.title}
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {data.exam.description ??
                      'Pastikan Team memahami ketentuan dan jadwal pelaksanaan sebelum mengikuti ujian.'}
                  </p>
                </div>
              </div>

              <Badge
                variant={
                  examStatus === 'AVAILABLE'
                    ? 'default'
                    : 'outline'
                }
                className={
                  examStatus === 'AVAILABLE'
                    ? 'shrink-0'
                    : 'shrink-0 bg-secondary/10 text-secondary'
                }
              >
                {status.label}
              </Badge>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-4 text-secondary" />
                  Mulai
                </div>

                <p className="mt-2 text-sm font-medium">
                  {formatDate(data.exam.startDate, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-4 text-secondary" />
                  Selesai
                </div>

                <p className="mt-2 text-sm font-medium">
                  {formatDate(data.exam.endDate, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="size-4 text-secondary" />
                  Durasi
                </div>

                <p className="mt-2 text-sm font-medium">
                  {data.exam.duration} menit
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-secondary" />
                  Percobaan
                </div>

                <p className="mt-2 text-sm font-medium">
                  Maks. {data.exam.maxAttempts}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card
          className={cn(
            'border bg-card/50 backdrop-blur-xl',
            examStatus === 'AVAILABLE'
              ? 'border-accent/25'
              : 'border-white/10',
          )}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                  examStatus === 'AVAILABLE'
                    ? 'bg-accent/10'
                    : 'bg-secondary/10',
                )}
              >
                <StatusIcon
                  className={cn(
                    'size-5',
                    examStatus === 'AVAILABLE'
                      ? 'text-accent'
                      : 'text-secondary',
                  )}
                />
              </div>

              <div>
                <CardTitle className="text-xl font-bold">
                  {status.title}
                </CardTitle>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {status.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <CalendarDays className="size-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Perhatikan jadwal
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Ujian hanya dapat diikuti dalam periode
                  pelaksanaan yang telah ditentukan.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <Clock3 className="size-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Kelola waktu
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Perhatikan durasi ujian agar seluruh soal dapat
                  diselesaikan tepat waktu.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <ShieldCheck className="size-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Gunakan akun Team
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Akses ujian hanya tersedia untuk Team yang
                  terdaftar dan memiliki hak mengikuti tahap ini.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}