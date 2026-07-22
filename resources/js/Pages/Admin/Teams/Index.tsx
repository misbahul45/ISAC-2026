import { Link } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, Eye, FilterX } from 'lucide-react'
import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminStatusBadge } from '@/features/admin/components/AdminStatusBadge'
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from '@/features/admin/components/AdminStates'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { useAdminBatches, useAdminCompetitions, useAdminTeams } from '@/features/admin/hooks/useAdmin'
import type { AdminTeamFilters } from '@/features/admin/types/adminTypes'
import { cn } from '@/lib/utils'

const teamStatuses = ['INCOMPLETE', 'WAITING_VERIFICATION', 'VERIFIED', 'REVISION_REQUIRED', 'REJECTED'] as const

function formatDate(value: string | null | undefined) {
  if (!value) return 'Belum submit'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function AdminTeamsIndex() {
  const [filters, setFilters] = useState<AdminTeamFilters>({ page: 1, per_page: 15 })
  const teamsQuery = useAdminTeams(filters)
  const competitionsQuery = useAdminCompetitions({ perPage: 100 })
  const batchesQuery = useAdminBatches(filters.competition_id)
  const pagination = teamsQuery.data?.data
  const teams = pagination?.data ?? []

  function updateFilter<K extends keyof AdminTeamFilters>(key: K, value: AdminTeamFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value, page: 1, ...(key === 'competition_id' ? { batch_id: '' } : {}) }))
  }

  function resetFilters() {
    setFilters({ page: 1, per_page: 15 })
  }

  return (
    <>
      <Seo title="Verifikasi Tim Admin" description="Daftar dan status pendaftaran tim ISAC 2026." canonical="/admin/teams" noindex />
      <AdminPageHeader title="Verifikasi Tim" description="Filter pendaftaran berdasarkan status, kompetisi, dan batch, lalu buka detail untuk melakukan review." />

      <Card className="mb-5 border-border/60 bg-card/70 backdrop-blur-md">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="space-y-1.5 text-xs text-muted-foreground">Status tim
            <select value={filters.status ?? ''} onChange={(event) => updateFilter('status', event.target.value as AdminTeamFilters['status'])} className="h-10 w-full rounded-3xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Semua status</option>
              {teamStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs text-muted-foreground">Kompetisi
            <select value={filters.competition_id ?? ''} onChange={(event) => updateFilter('competition_id', event.target.value)} className="h-10 w-full rounded-3xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Semua kompetisi</option>
              {competitionsQuery.data?.data.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs text-muted-foreground">Batch
            <select value={filters.batch_id ?? ''} onChange={(event) => updateFilter('batch_id', event.target.value)} className="h-10 w-full rounded-3xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Semua batch</option>
              {batchesQuery.data?.data.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
            </select>
          </label>
          <Button variant="outline" className="self-end" onClick={resetFilters}><FilterX />Reset</Button>
        </CardContent>
      </Card>

      {teamsQuery.isLoading ? <AdminLoadingState label="Memuat daftar tim..." /> : teamsQuery.error ? <AdminErrorState message={teamsQuery.error.message} retry={() => teamsQuery.refetch()} /> : teams.length === 0 ? <AdminEmptyState title="Tidak ada tim" description="Belum ada tim yang sesuai dengan filter aktif." /> : (
        <>
          <Card className="hidden overflow-hidden border-border/60 bg-card/70 backdrop-blur-md md:block">
            <Table>
              <TableHeader><TableRow><TableHead>Tim</TableHead><TableHead>Institusi</TableHead><TableHead>Kompetisi</TableHead><TableHead>Status Tim</TableHead><TableHead>Status Registrasi</TableHead><TableHead>Submit</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
              <TableBody>
                {teams.map((item) => (
                  <TableRow key={item.team.id}>
                    <TableCell><div><p className="font-medium text-foreground">{item.team.name ?? 'Belum dilengkapi'}</p><p className="text-xs text-muted-foreground">{item.team.code}</p></div></TableCell>
                    <TableCell className="max-w-52 whitespace-normal text-muted-foreground">{item.team.institutionName ?? '—'}</TableCell>
                    <TableCell><div><p>{item.registration?.competition.name ?? '—'}</p><p className="text-xs text-muted-foreground">{item.registration?.batch.name ?? 'Belum memilih batch'}</p></div></TableCell>
                    <TableCell><AdminStatusBadge status={item.team.status} /></TableCell>
                    <TableCell>{item.registration ? <AdminStatusBadge status={item.registration.status} /> : '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(item.registration?.submittedAt)}</TableCell>
                    <TableCell className="text-right"><Link href={`/admin/teams/${item.team.id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}><Eye />Detail</Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-3 md:hidden">
            {teams.map((item) => (
              <Card key={item.team.id} className="border-border/60 bg-card/70"><CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.team.name ?? 'Belum dilengkapi'}</p><p className="text-xs text-muted-foreground">{item.team.code} · {item.team.institutionName ?? 'Institusi belum diisi'}</p></div><AdminStatusBadge status={item.team.status} /></div>
                <div className="grid grid-cols-2 gap-3 text-xs"><div><p className="text-muted-foreground">Kompetisi</p><p className="mt-1">{item.registration?.competition.name ?? '—'}</p></div><div><p className="text-muted-foreground">Registrasi</p><div className="mt-1">{item.registration ? <AdminStatusBadge status={item.registration.status} /> : '—'}</div></div></div>
                <Link href={`/admin/teams/${item.team.id}`} className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}><Eye />Lihat Detail</Link>
              </CardContent></Card>
            ))}
          </div>

          {pagination && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
              <p>Menampilkan {pagination.meta.from ?? 0}–{pagination.meta.to ?? 0} dari {pagination.meta.total} tim</p>
              <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={pagination.meta.current_page <= 1} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}><ChevronLeft />Sebelumnya</Button><span className="px-2">{pagination.meta.current_page} / {pagination.meta.last_page}</span><Button variant="outline" size="sm" disabled={pagination.meta.current_page >= pagination.meta.last_page} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}>Berikutnya<ChevronRight /></Button></div>
            </div>
          )}
        </>
      )}
    </>
  )
}

AdminTeamsIndex.layout = adminPageLayout
