import { router } from '@inertiajs/react'
import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Clock3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'

export default function DashboardIndex() {
  const { principal, isAuthenticated, isLoading } = useAuthSession()
  const { summary, summaryQuery } = useDashboard()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.visit('/auth/login')
    else if (principal?.principalType === 'ADMIN') router.visit('/admin/dashboard')
  }, [isAuthenticated, isLoading, principal])

  useEffect(() => {
    if (summary && summary.currentStep !== 'DASHBOARD') {
      router.visit(summary.redirectTo, { replace: true })
    }
  }, [summary])

  if (summaryQuery.isLoading) {
    return <main className="relative z-10 min-h-screen px-4 pt-12 text-center text-white">Memuat dashboard...</main>
  }

  if (summaryQuery.error || !summary) {
    return <main className="relative z-10 min-h-screen px-4 pt-12 text-center text-red-400">{summaryQuery.error?.message ?? 'Dashboard tidak tersedia.'}</main>
  }

  if (summary.currentStep !== 'DASHBOARD') {
    return <main className="relative z-10 min-h-screen px-4 pt-12 text-center text-white">Mengarahkan ke progres registrasi...</main>
  }

  const statusIcon = summary.team.status === 'VERIFIED' ? CheckCircle2 : summary.team.status === 'REJECTED' ? AlertCircle : Clock3
  const StatusIcon = statusIcon

  return (
    <main className="relative z-10 min-h-screen px-4 pb-16 pt-12 text-primary-foreground">
      <Seo title="Dashboard Team" description="Status pendaftaran Team ISAC 2026." canonical="/dashboard" noindex />
      <div className="mx-auto max-w-6xl space-y-6">
        <Card className="border-border/50 bg-background/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><StatusIcon className="size-6 text-primary" />{summary.team.name ?? summary.team.code}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{summary.nextAction}</p>
            {summary.team.verificationNote && <p className="text-amber-400">Catatan panitia: {summary.team.verificationNote}</p>}
            {summary.payment?.rejectionReason && <p className="text-red-400">Catatan pembayaran: {summary.payment.rejectionReason}</p>}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card/70"><CardContent className="flex items-center gap-3 pt-6"><Users className="size-5 text-secondary" /><div><p className="text-sm text-muted-foreground">Peserta</p><p className="text-2xl font-bold">{summary.team.memberCount}</p></div></CardContent></Card>
          <Card className="border-border/50 bg-card/70"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Kompetisi</p><p className="font-semibold">{summary.registration?.competition.name ?? 'Belum dipilih'}</p></CardContent></Card>
          <Card className="border-border/50 bg-card/70"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Tahap</p><p className="font-semibold">{summary.team.currentStage?.name ?? 'Menunggu aktivasi'}</p></CardContent></Card>
        </div>
      </div>
    </main>
  )
}
