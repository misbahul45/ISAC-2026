import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiClientError } from '@/lib/api'
import { useCreateBatch, useUpdateBatch } from '../hooks/useAdmin'
import type { AdminBatch, AdminCompetition, BatchPayload } from '../types/adminTypes'

const emptyForm: BatchPayload = {
  competition_id: '', name: '', slug: '', description: '', start_date: '', end_date: '', price: 0, module_file_id: null, quota: null, status: 'DRAFT',
}

function dateTimeValue(value: string | null | undefined) {
  return value ? value.slice(0, 16) : ''
}

export function BatchFormDialog({ open, onOpenChange, batch, competitions }: { open: boolean; onOpenChange: (open: boolean) => void; batch: AdminBatch | null; competitions: AdminCompetition[] }) {
  const [form, setForm] = useState<BatchPayload>(emptyForm)
  const [localError, setLocalError] = useState('')
  const create = useCreateBatch()
  const update = useUpdateBatch()
  const mutation = batch ? update : create
  const apiError = mutation.error instanceof ApiClientError ? mutation.error : null

  useEffect(() => {
    if (!open) return
    setForm(batch ? {
      competition_id: batch.competitionId,
      name: batch.name,
      slug: batch.slug,
      description: batch.description ?? '',
      start_date: dateTimeValue(batch.startAt),
      end_date: dateTimeValue(batch.endAt),
      price: Number(batch.price),
      module_file_id: batch.moduleFileId,
      quota: batch.quota,
      status: batch.status,
    } : { ...emptyForm, competition_id: competitions[0]?.id ?? '' })
    setLocalError('')
  }, [batch, competitions, open])

  function setField<K extends keyof BatchPayload>(key: K, value: BatchPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setLocalError('')
    mutation.reset()
  }

  async function submit() {
    if (!form.competition_id || !form.name.trim() || !form.slug.trim() || !form.start_date || !form.end_date) {
      setLocalError('Kompetisi, nama, slug, dan periode batch wajib diisi.')
      return
    }
    if (form.end_date <= form.start_date) {
      setLocalError('Tanggal selesai harus setelah tanggal mulai.')
      return
    }
    try {
      if (batch) {
        const { competition_id: _, ...payload } = form
        await update.mutateAsync({ id: batch.id, payload })
      } else {
        await create.mutateAsync(form)
      }
      toast.success(batch ? 'Batch berhasil diperbarui.' : 'Batch berhasil dibuat.')
      onOpenChange(false)
    } catch {
      // Kesalahan API ditampilkan di bawah form.
    }
  }

  const fieldError = (field: string) => apiError?.fields[field]?.[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{batch ? 'Edit Batch' : 'Buat Batch'}</DialogTitle><DialogDescription>Atur periode, harga, kuota, dan modul batch pendaftaran.</DialogDescription></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm sm:col-span-2">Kompetisi<select disabled={Boolean(batch)} value={form.competition_id} onChange={(event) => setField('competition_id', event.target.value)} className="h-9 w-full rounded-3xl border border-input bg-input/50 px-3 disabled:opacity-60"><option value="">Pilih kompetisi</option>{competitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}</select>{fieldError('competition_id') && <span className="text-xs text-destructive">{fieldError('competition_id')}</span>}</label>
          <label className="space-y-1.5 text-sm">Nama batch<Input value={form.name} onChange={(event) => setField('name', event.target.value)} aria-invalid={Boolean(fieldError('name'))} />{fieldError('name') && <span className="text-xs text-destructive">{fieldError('name')}</span>}</label>
          <label className="space-y-1.5 text-sm">Slug<Input value={form.slug} onChange={(event) => setField('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))} aria-invalid={Boolean(fieldError('slug'))} />{fieldError('slug') && <span className="text-xs text-destructive">{fieldError('slug')}</span>}</label>
          <label className="space-y-1.5 text-sm">Tanggal mulai<Input type="datetime-local" value={form.start_date} onChange={(event) => setField('start_date', event.target.value)} /></label>
          <label className="space-y-1.5 text-sm">Tanggal selesai<Input type="datetime-local" value={form.end_date} onChange={(event) => setField('end_date', event.target.value)} /></label>
          <label className="space-y-1.5 text-sm">Harga<Input type="number" min={0} value={form.price} onChange={(event) => setField('price', Number(event.target.value))} aria-invalid={Boolean(fieldError('price'))} /></label>
          <label className="space-y-1.5 text-sm">Kuota<Input type="number" min={1} value={form.quota ?? ''} onChange={(event) => setField('quota', event.target.value ? Number(event.target.value) : null)} placeholder="Tanpa batas" /></label>
          <label className="space-y-1.5 text-sm">Status<select value={form.status} onChange={(event) => setField('status', event.target.value as BatchPayload['status'])} className="h-9 w-full rounded-3xl border border-input bg-input/50 px-3"><option value="DRAFT">Draft</option><option value="OPEN">Dibuka</option><option value="CLOSED">Ditutup</option><option value="FULL">Penuh</option></select></label>
          <label className="space-y-1.5 text-sm">ID file modul<Input value={form.module_file_id ?? ''} onChange={(event) => setField('module_file_id', event.target.value || null)} placeholder="Opsional" /></label>
          <label className="space-y-1.5 text-sm sm:col-span-2">Deskripsi<Textarea value={form.description ?? ''} onChange={(event) => setField('description', event.target.value)} /></label>
        </div>
        {(localError || mutation.error) && <p className="rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{localError || mutation.error?.message}</p>}
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button><Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? 'Menyimpan...' : 'Simpan Batch'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

