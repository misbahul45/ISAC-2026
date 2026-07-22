import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminStatusBadge } from '@/features/admin/components/AdminStatusBadge'
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from '@/features/admin/components/AdminStates'
import { BatchFormDialog } from '@/features/admin/components/BatchFormDialog'
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog'
import { useAdminBatches, useAdminCompetitions, useDeleteBatch } from '@/features/admin/hooks/useAdmin'
import type { AdminBatch } from '@/features/admin/types/adminTypes'
import { useAuthSession } from '@/features/auth/context/AuthProvider'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))
}

export default function AdminBatches() {
  const { principal } = useAuthSession()
  const [competitionId, setCompetitionId] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminBatch | null>(null)
  const [deleting, setDeleting] = useState<AdminBatch | null>(null)
  const competitionsQuery = useAdminCompetitions({ perPage: 100 })
  const batchesQuery = useAdminBatches(competitionId)
  const deleteMutation = useDeleteBatch()
  const admin = principal?.principalType === 'ADMIN' ? principal.admin : null
  const canManage = admin?.role === 'super_admin' || admin?.role === 'admin_registration'
  const competitions = useMemo(() => competitionsQuery.data?.data ?? [], [competitionsQuery.data])
  const competitionNames = useMemo(() => Object.fromEntries(competitions.map((competition) => [competition.id, competition.name])), [competitions])
  const batches = (batchesQuery.data?.data ?? []).filter((batch) => !status || batch.status === status)

  function openCreate() { setEditing(null); setFormOpen(true) }
  function openEdit(batch: AdminBatch) { setEditing(batch); setFormOpen(true) }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success('Batch berhasil dihapus.')
      setDeleting(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Batch tidak dapat dihapus.')
    }
  }

  return (
    <>
      <Seo title="Batch Admin" description="Kelola periode dan kuota batch ISAC 2026." canonical="/admin/batches" noindex />
      <AdminPageHeader title="Batch" description="Pantau harga, periode, jumlah pendaftar, dan sisa kuota setiap batch." action={canManage ? <Button onClick={openCreate}><Plus />Buat Batch</Button> : undefined} />

      <Card className="mb-5 border-border/60 bg-card/70"><CardContent className="grid gap-3 p-4 sm:grid-cols-2">
        <select value={competitionId} onChange={(event) => setCompetitionId(event.target.value)} className="h-9 rounded-3xl border border-input bg-background/60 px-3 text-sm"><option value="">Semua kompetisi</option>{competitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-3xl border border-input bg-background/60 px-3 text-sm"><option value="">Semua status</option><option value="DRAFT">Draft</option><option value="OPEN">Dibuka</option><option value="CLOSED">Ditutup</option><option value="FULL">Penuh</option></select>
      </CardContent></Card>

      {batchesQuery.isLoading || competitionsQuery.isLoading ? <AdminLoadingState label="Memuat batch..." /> : batchesQuery.error || competitionsQuery.error ? <AdminErrorState message={batchesQuery.error?.message ?? competitionsQuery.error?.message ?? 'Data gagal dimuat.'} retry={() => { batchesQuery.refetch(); competitionsQuery.refetch() }} /> : batches.length === 0 ? <AdminEmptyState title="Batch tidak ditemukan" description="Ubah filter atau buat batch baru untuk kompetisi yang tersedia." /> : (
        <>
          <Card className="hidden overflow-hidden border-border/60 bg-card/70 md:block"><Table><TableHeader><TableRow><TableHead>Batch</TableHead><TableHead>Kompetisi</TableHead><TableHead>Periode</TableHead><TableHead>Harga</TableHead><TableHead>Kapasitas</TableHead><TableHead>Status</TableHead>{canManage && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader><TableBody>
            {batches.map((batch) => <TableRow key={batch.id}><TableCell><p className="font-medium">{batch.name}</p><p className="text-xs text-muted-foreground">{batch.slug}</p></TableCell><TableCell className="max-w-52 whitespace-normal">{competitionNames[batch.competitionId] ?? batch.competitionId}</TableCell><TableCell className="text-xs text-muted-foreground">{formatDate(batch.startAt)} – {formatDate(batch.endAt)}</TableCell><TableCell>{formatCurrency(batch.price)}</TableCell><TableCell><p>{batch.currentRegistrations} / {batch.quota ?? '∞'}</p><p className="text-xs text-muted-foreground">Sisa {batch.remainingQuota ?? 'tanpa batas'}</p></TableCell><TableCell><AdminStatusBadge status={batch.status} /></TableCell>{canManage && <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" onClick={() => openEdit(batch)}><Pencil /></Button><Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setDeleting(batch)}><Trash2 /></Button></div></TableCell>}</TableRow>)}
          </TableBody></Table></Card>
          <div className="space-y-3 md:hidden">{batches.map((batch) => <Card key={batch.id} className="border-border/60 bg-card/70"><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{batch.name}</p><p className="text-xs text-muted-foreground">{competitionNames[batch.competitionId]}</p></div><AdminStatusBadge status={batch.status} /></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Harga</p><p>{formatCurrency(batch.price)}</p></div><div><p className="text-xs text-muted-foreground">Kapasitas</p><p>{batch.currentRegistrations} / {batch.quota ?? '∞'}</p></div></div><p className="text-xs text-muted-foreground">{formatDate(batch.startAt)} – {formatDate(batch.endAt)}</p>{canManage && <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => openEdit(batch)}><Pencil />Edit</Button><Button variant="destructive" size="icon" onClick={() => setDeleting(batch)}><Trash2 /></Button></div>}</CardContent></Card>)}</div>
        </>
      )}

      <BatchFormDialog open={formOpen} onOpenChange={setFormOpen} batch={editing} competitions={competitions} />
      <ConfirmActionDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null) }} title="Hapus batch?" description={`Batch ${deleting?.name ?? ''} hanya dapat dihapus jika belum digunakan pendaftaran.`} confirmLabel="Hapus Batch" pending={deleteMutation.isPending} onConfirm={confirmDelete} />
    </>
  )
}

AdminBatches.layout = adminPageLayout
