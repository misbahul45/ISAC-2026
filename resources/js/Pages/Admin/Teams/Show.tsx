import { Link } from '@inertiajs/react'
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, Mail, MapPin, Phone, RotateCcw, ShieldX, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminStatusBadge } from '@/features/admin/components/AdminStatusBadge'
import { AdminErrorState, AdminLoadingState } from '@/features/admin/components/AdminStates'
import { TeamReviewDialog } from '@/features/admin/components/TeamReviewDialog'
import { useAdminTeam } from '@/features/admin/hooks/useAdmin'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { formatInstitutionAddress } from '@/features/registrations/utils/institutionAddress'
import { cn } from '@/lib/utils'

function display(value: string | null | undefined) {
  return value || '—'
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
}

export default function AdminTeamShow({ teamId }: { teamId: string }) {
  const { principal } = useAuthSession()
  const query = useAdminTeam(teamId)
  const [reviewAction, setReviewAction] = useState<'verify' | 'revise' | 'reject' | null>(null)
  const data = query.data?.data
  const role = principal?.principalType === 'ADMIN' ? principal.admin.role : null
  const canReview = role === 'super_admin' || role === 'admin_registration'
  const waitingReview = data?.team.status === 'WAITING_VERIFICATION'

  if (query.isLoading) return <AdminLoadingState label="Memuat detail tim..." />
  if (query.error || !data) return <AdminErrorState message={query.error?.message ?? 'Detail tim tidak ditemukan.'} retry={() => query.refetch()} />

  return (
    <>
      <Seo title={`${data.team.name ?? data.team.code} · Admin`} description="Detail pendaftaran tim ISAC 2026." canonical={`/admin/teams/${teamId}`} noindex />
      <AdminPageHeader
        title={data.team.name ?? data.team.code}
        description={`${data.team.code} · ${data.registration?.competition.name ?? 'Belum memilih kompetisi'}`}
        action={<Link href="/admin/teams" className={cn(buttonVariants({ variant: 'outline' }))}><ArrowLeft />Kembali</Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-6">
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader className="flex-row items-center justify-between gap-3"><CardTitle>Profil Tim</CardTitle><AdminStatusBadge status={data.team.status} /></CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-secondary" /><div><p className="text-xs text-muted-foreground">Email</p><p>{display(data.team.email)}</p></div></div>
              <div className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-secondary" /><div><p className="text-xs text-muted-foreground">Nomor telepon</p><p>{display(data.team.phone)}</p></div></div>
              <div className="flex gap-3"><UserRound className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-xs text-muted-foreground">Sekolah / Institusi</p><p>{display(data.team.institutionName)}</p></div></div>
              <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-xs text-muted-foreground">Alamat</p><p>{formatInstitutionAddress(data.team.institutionAddress) || '—'}</p></div></div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader><CardTitle>Peserta ({data.members.length})</CardTitle></CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              {data.members.map((member) => (
                <div key={member.id} className="rounded-3xl border border-border bg-background/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2"><p className="font-medium">{member.name}</p><AdminStatusBadge status={member.role} /></div>
                  <dl className="space-y-2 text-xs"><div><dt className="text-muted-foreground">Email</dt><dd>{member.email}</dd></div><div><dt className="text-muted-foreground">NISN / NIM</dt><dd>{member.studentId}</dd></div>{member.major && <div><dt className="text-muted-foreground">Program studi</dt><dd>{member.major}</dd></div>}{member.faculty && <div><dt className="text-muted-foreground">Fakultas</dt><dd>{member.faculty}</dd></div>}</dl>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader><CardTitle>Dokumen</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {data.team.documentUrl ? <a href={data.team.documentUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'outline' }), 'justify-between')}><span className="flex items-center gap-2"><FileText />Folder Dokumen</span><ExternalLink /></a> : <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">Folder dokumen belum tersedia.</div>}
              {data.team.twibbonUrl ? <a href={data.team.twibbonUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'outline' }), 'justify-between')}><span className="flex items-center gap-2"><FileText />Folder Twibbon</span><ExternalLink /></a> : <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">Folder twibbon belum tersedia.</div>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader><CardTitle>Registrasi</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div><p className="text-xs text-muted-foreground">Status</p><div className="mt-1">{data.registration ? <AdminStatusBadge status={data.registration.status} /> : '—'}</div></div>
              <div><p className="text-xs text-muted-foreground">Kompetisi</p><p>{display(data.registration?.competition.name)}</p></div>
              <div><p className="text-xs text-muted-foreground">Batch</p><p>{display(data.registration?.batch.name)}</p></div>
              <div><p className="text-xs text-muted-foreground">Dikirim</p><p>{formatDate(data.registration?.submittedAt)}</p></div>
              {data.team.verificationNote && <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-3 text-amber-200"><p className="text-xs font-medium">Catatan verifikasi</p><p className="mt-1 text-sm">{data.team.verificationNote}</p></div>}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader><CardTitle>Keputusan Review</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!canReview ? <p className="text-sm text-muted-foreground">Role Anda hanya dapat melihat detail tim.</p> : !waitingReview ? <p className="text-sm text-muted-foreground">Aksi review hanya tersedia ketika tim berstatus Menunggu Verifikasi.</p> : <><Button className="w-full" onClick={() => setReviewAction('verify')}><CheckCircle2 />Verifikasi Tim</Button><Button variant="outline" className="w-full" onClick={() => setReviewAction('revise')}><RotateCcw />Minta Revisi</Button><Button variant="destructive" className="w-full" onClick={() => setReviewAction('reject')}><ShieldX />Tolak Tim</Button></>}
            </CardContent>
          </Card>

          <Card className="border-dashed border-border bg-card/45"><CardContent className="p-4 text-sm"><p className="font-medium">Pembayaran & Tahapan</p><p className="mt-1 text-muted-foreground">Menunggu endpoint detail payment proof dan daftar next-stage. Tidak ada action yang ditampilkan agar keputusan admin tetap aman.</p></CardContent></Card>
        </div>
      </div>

      {reviewAction && <TeamReviewDialog teamId={teamId} action={reviewAction} open onOpenChange={(open) => { if (!open) setReviewAction(null) }} />}
    </>
  )
}

AdminTeamShow.layout = adminPageLayout
