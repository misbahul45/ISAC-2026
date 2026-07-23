import { Link } from '@inertiajs/react'
import { Banknote, CheckCircle2, Clock3, Layers3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { adminRoleLabels } from '@/constants/admin'

const stats = [
  { label: 'Total Tim', icon: Users, tone: 'text-primary', background: 'bg-primary/10' },
  { label: 'Menunggu Review Tim', icon: Clock3, tone: 'text-secondary', background: 'bg-secondary/10' },
  { label: 'Menunggu Pembayaran', icon: Banknote, tone: 'text-amber-300', background: 'bg-amber-400/10' },
  { label: 'Tim Terverifikasi', icon: CheckCircle2, tone: 'text-accent', background: 'bg-accent/10' },
]

export default function AdminDashboard() {
  const { principal } = useAuthSession()
  const admin = principal?.principalType === 'ADMIN' ? principal.admin : null
  const canViewTeams = admin && ['super_admin', 'admin_registration', 'admin_payment'].includes(admin.role)

  return (
    <>
      <Seo title="Admin Dashboard" description="Pusat operasional Admin ISAC 2026." canonical="/admin/dashboard" noindex />
      <AdminPageHeader
        title={`Selamat datang${admin ? `, ${admin.name}` : ''}`}
        description={admin ? `${adminRoleLabels[admin.role]} · Pantau antrean operasional dan akses modul administrasi ISAC 2026.` : 'Memuat profil admin...'}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan operasional">
        {stats.map(({ label, icon: Icon, tone, background }) => (
          <Card key={label} className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">—</p>
                <p className="mt-1 text-xs text-muted-foreground">Menunggu summary admin</p>
              </div>
              <div className={`rounded-2xl p-2.5 ${background} ${tone}`}><Icon className="size-5" /></div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader><CardTitle>Antrean pekerjaan</CardTitle></CardHeader>
          <CardContent>
            <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/25 px-5 text-center">
              <Clock3 className="mb-3 size-8 text-secondary" />
              <p className="font-medium">Summary admin belum diaktifkan</p>
              <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">Antrean tim dan pembayaran tidak dihitung dari pagination agar statistik tetap akurat. Gunakan modul Verifikasi Tim untuk data aktif saat ini.</p>
              {canViewTeams && <Link href="/admin/teams" className="mt-4 text-sm font-medium text-primary hover:text-primary/80">Buka Verifikasi Tim →</Link>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader><CardTitle>Akses cepat</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {canViewTeams && <Link href="/admin/teams" className="flex items-center gap-3 rounded-2xl border border-border bg-background/30 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"><Users className="size-5 text-secondary" /><div><p className="font-medium">Verifikasi Tim</p><p className="text-xs text-muted-foreground">Tinjau data pendaftaran peserta.</p></div></Link>}
            {canViewTeams && <Link href="/admin/payments" className="flex items-center gap-3 rounded-2xl border border-border bg-background/30 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"><Banknote className="size-5 text-amber-300" /><div><p className="font-medium">Pembayaran</p><p className="text-xs text-muted-foreground">Antrean dan verifikasi pembayaran.</p></div></Link>}
            <Link href="/admin/competitions" className="flex items-center gap-3 rounded-2xl border border-border bg-background/30 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"><Layers3 className="size-5 text-primary" /><div><p className="font-medium">Kompetisi</p><p className="text-xs text-muted-foreground">Kelola informasi kompetisi.</p></div></Link>
            <Link href="/admin/batches" className="flex items-center gap-3 rounded-2xl border border-border bg-background/30 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"><CheckCircle2 className="size-5 text-accent" /><div><p className="font-medium">Batch</p><p className="text-xs text-muted-foreground">Pantau periode, harga, dan kuota.</p></div></Link>
          </CardContent>
        </Card>
      </section>
    </>
  )
}

AdminDashboard.layout = adminPageLayout
