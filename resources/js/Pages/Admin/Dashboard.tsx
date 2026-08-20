import { Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, CheckCircle2, Clock3, Layers3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { adminRoleLabels } from '@/constants/admin'
import { getJson } from '@/lib/api'

type Summary = {
  totals: { teams: number; waitingVerification: number; waitingPayment: number; verified: number }
  teamsByCompetition: { label: string; total: number }[]
  teamsByStatus: { label: string; total: number }[]
  activity: { date: string; label: string; total: number }[]
}

const stats = [
  { key: 'teams', label: 'Total Tim', icon: Users, tone: 'text-primary', background: 'bg-primary/10' },
  { key: 'waitingVerification', label: 'Menunggu Review Tim', icon: Clock3, tone: 'text-secondary', background: 'bg-secondary/10' },
  { key: 'waitingPayment', label: 'Menunggu Pembayaran', icon: Banknote, tone: 'text-amber-300', background: 'bg-amber-400/10' },
  { key: 'verified', label: 'Tim Terverifikasi', icon: CheckCircle2, tone: 'text-accent', background: 'bg-accent/10' },
] as const

export default function AdminDashboard() {
  const { principal } = useAuthSession()
  const admin = principal?.principalType === 'ADMIN' ? principal.admin : null
  const canViewTeams = admin && ['super_admin', 'admin_registration', 'admin_payment'].includes(admin.role)
  const summary = useQuery({
    queryKey: ['admin', 'dashboard-summary'],
    queryFn: () => getJson<{ data: Summary }>('/api/admin/dashboard/summary'),
    staleTime: 30_000,
  })
  const data = summary.data?.data

  return (
    <>
      <Seo title="Admin Dashboard" description="Pusat operasional Admin ISAC 2026." canonical="/admin/dashboard" noindex />
      <AdminPageHeader title={'Selamat datang' + (admin ? ', ' + admin.name : '')} description={admin ? adminRoleLabels[admin.role] + ' · Pantau antrean operasional dan akses modul administrasi ISAC 2026.' : 'Memuat profil admin...'} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan operasional">
        {stats.map(({ key, label, icon: Icon, tone, background }) => (
          <Card key={label} className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardContent className="flex items-start justify-between p-5">
              <div><p className="text-sm text-muted-foreground">{label}</p>{summary.isLoading ? <Skeleton className="mt-3 h-9 w-16" /> : <p className="mt-3 text-3xl font-semibold text-foreground">{data?.totals[key] ?? 0}</p>}<p className="mt-1 text-xs text-muted-foreground">Data operasional real-time</p></div>
              <div className={'rounded-2xl p-2.5 ' + background + ' ' + tone}><Icon className="size-5" /></div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60 bg-card/70"><CardHeader><CardTitle>Tim per kompetisi</CardTitle></CardHeader><CardContent className="h-72">{summary.isLoading ? <Skeleton className="h-full w-full" /> : <ResponsiveContainer width="100%" height="100%"><BarChart data={data?.teamsByCompetition ?? []}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: 'hsl(var(--muted))' }} /><Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>}</CardContent></Card>
        <Card className="border-border/60 bg-card/70"><CardHeader><CardTitle>Aktivitas Admin · 7 hari</CardTitle></CardHeader><CardContent className="h-72">{summary.isLoading ? <Skeleton className="h-full w-full" /> : <ResponsiveContainer width="100%" height="100%"><LineChart data={data?.activity ?? []}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="label" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="total" stroke="hsl(var(--chart-2, var(--secondary)))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer>}</CardContent></Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card className="border-border/60 bg-card/70"><CardHeader><CardTitle>Antrean pekerjaan</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">{[{ label: 'Review data', value: data?.totals.waitingVerification ?? 0, href: '/admin/teams' }, { label: 'Review pembayaran', value: data?.totals.waitingPayment ?? 0, href: '/admin/payments' }, { label: 'Terverifikasi', value: data?.totals.verified ?? 0, href: '/admin/teams' }].map((item) => <Link key={item.label} href={item.href} className="rounded-2xl border border-border bg-background/30 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"><p className="text-2xl font-semibold">{item.value}</p><p className="mt-1 text-sm text-muted-foreground">{item.label}</p></Link>)}</CardContent></Card>
        <Card className="border-border/60 bg-card/70"><CardHeader><CardTitle>Akses cepat</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{canViewTeams && <Link href="/admin/teams" className="rounded-2xl border border-border p-4 hover:bg-primary/5"><Users className="size-5 text-secondary" /><p className="mt-2 font-medium">Verifikasi Tim</p></Link>}<Link href="/admin/questions" className="rounded-2xl border border-border p-4 hover:bg-primary/5"><Layers3 className="size-5 text-primary" /><p className="mt-2 font-medium">Buat Soal</p></Link></CardContent></Card>
      </section>
    </>
  )
}

AdminDashboard.layout = adminPageLayout
