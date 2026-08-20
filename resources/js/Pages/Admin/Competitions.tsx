import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminStatusBadge } from '@/features/admin/components/AdminStatusBadge'
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from '@/features/admin/components/AdminStates'
import { CompetitionFormDialog } from '@/features/admin/components/CompetitionFormDialog'
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog'
import { useAdminCompetitions, useDeleteCompetition } from '@/features/admin/hooks/useAdmin'
import type { AdminCompetition, CompetitionFilters } from '@/features/admin/types/adminTypes'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { useDebounce } from '@/hooks/use-debounce'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

export default function AdminCompetitions() {
  const { principal } = useAuthSession()
  const [filters, setFilters] = useState<CompetitionFilters>({ page: 1, perPage: 15 })
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCompetition | null>(null)
  const [deleting, setDeleting] = useState<AdminCompetition | null>(null)
  const debouncedSearch = useDebounce(search, 350)
  const query = useAdminCompetitions({ ...filters, search: debouncedSearch })
  const deleteMutation = useDeleteCompetition()
  const admin = principal?.principalType === 'ADMIN' ? principal.admin : null
  const canManage = admin?.role === 'super_admin' || admin?.role === 'admin_registration'
  const pagination = query.data?.metadata.pagination

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(competition: AdminCompetition) {
    setEditing(competition)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Kompetisi berhasil dihapus.')
      setDeleting(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kompetisi tidak dapat dihapus.')
    }
  }

  return (
    <>
      <Seo title="Kompetisi Admin" description="Kelola kompetisi ISAC 2026." canonical="/admin/competitions" noindex />
      <AdminPageHeader title="Kompetisi" description="Kelola periode, status, dan konfigurasi kompetisi dari Admin." action={canManage ? <Button onClick={openCreate}><Plus />Buat Kompetisi</Button> : undefined} />

      <Card className="mb-5 border-border/60 bg-card/70"><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_220px_220px]">
        <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setFilters((current) => ({ ...current, page: 1 })) }} placeholder="Cari nama kompetisi..." className="pl-9" /></label>
        <select value={filters.type ?? ''} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as CompetitionFilters['type'], page: 1 }))} className="h-9 rounded-3xl border border-input bg-background/60 px-3 text-sm"><option value="">Semua tipe</option><option value="OLIMPIADE">Olimpiade</option><option value="BUSINESS_PLAN">Business Plan</option><option value="BUSINESS_IT_CASE">Business IT Case</option></select>
        <select value={filters.status ?? ''} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as CompetitionFilters['status'], page: 1 }))} className="h-9 rounded-3xl border border-input bg-background/60 px-3 text-sm"><option value="">Semua status</option><option value="DRAFT">Draft</option><option value="REGISTRATION_OPEN">Pendaftaran Dibuka</option><option value="REGISTRATION_CLOSED">Pendaftaran Ditutup</option><option value="ONGOING">Berlangsung</option><option value="COMPLETED">Selesai</option></select>
      </CardContent></Card>

      {query.isLoading ? <AdminLoadingState label="Memuat kompetisi..." /> : query.error ? <AdminErrorState message={query.error.message} retry={() => query.refetch()} /> : !query.data?.data.length ? <AdminEmptyState title="Kompetisi tidak ditemukan" description="Ubah filter atau buat kompetisi baru." /> : (
        <>
          <Card className="hidden overflow-hidden border-border/60 bg-card/70 md:block"><Table><TableHeader><TableRow><TableHead>Kompetisi</TableHead><TableHead>Tipe</TableHead><TableHead>Payment Flow</TableHead><TableHead>Periode</TableHead><TableHead>Status</TableHead>{canManage && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader><TableBody>
            {query.data.data.map((competition) => <TableRow key={competition.id}><TableCell className="max-w-80 whitespace-normal"><p className="font-medium">{competition.name}</p><p className="line-clamp-1 text-xs text-muted-foreground">{competition.description ?? competition.slug}</p></TableCell><TableCell>{competition.type.replace(/_/g, ' ')}</TableCell><TableCell>{competition.paymentFlow}</TableCell><TableCell className="text-xs text-muted-foreground">{formatDate(competition.startDate)} – {formatDate(competition.endDate)}</TableCell><TableCell><AdminStatusBadge status={competition.status} /></TableCell>{canManage && <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" onClick={() => openEdit(competition)} aria-label={`Edit ${competition.name}`}><Pencil /></Button><Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setDeleting(competition)} aria-label={`Hapus ${competition.name}`}><Trash2 /></Button></div></TableCell>}</TableRow>)}
          </TableBody></Table></Card>

          <div className="space-y-3 md:hidden">{query.data.data.map((competition) => <Card key={competition.id} className="border-border/60 bg-card/70"><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{competition.name}</p><p className="text-xs text-muted-foreground">{competition.type.replace(/_/g, ' ')}</p></div><AdminStatusBadge status={competition.status} /></div><p className="line-clamp-2 text-sm text-muted-foreground">{competition.description ?? 'Tanpa deskripsi'}</p><p className="text-xs">{formatDate(competition.startDate)} – {formatDate(competition.endDate)}</p>{canManage && <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => openEdit(competition)}><Pencil />Edit</Button><Button variant="destructive" size="icon" onClick={() => setDeleting(competition)}><Trash2 /></Button></div>}</CardContent></Card>)}</div>

          {pagination && <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground"><p>{pagination.total} kompetisi</p><div className="flex items-center gap-2"><Button variant="outline" size="icon-sm" disabled={pagination.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}><ChevronLeft /></Button><span>{pagination.page} / {pagination.lastPage}</span><Button variant="outline" size="icon-sm" disabled={pagination.page >= pagination.lastPage} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}><ChevronRight /></Button></div></div>}
        </>
      )}

      <CompetitionFormDialog open={formOpen} onOpenChange={setFormOpen} competition={editing} />
      <ConfirmActionDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null) }} title="Hapus kompetisi?" description={`Kompetisi ${deleting?.name ?? ''} hanya dapat dihapus jika tidak memiliki data terkait.`} confirmLabel="Hapus Kompetisi" pending={deleteMutation.isPending} onConfirm={confirmDelete} />
    </>
  )
}

AdminCompetitions.layout = adminPageLayout
