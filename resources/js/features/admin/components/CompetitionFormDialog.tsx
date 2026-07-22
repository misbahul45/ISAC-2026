import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiClientError } from '@/lib/api'
import { useCreateCompetition, useUpdateCompetition } from '../hooks/useAdmin'
import type { AdminCompetition, CompetitionPayload } from '../types/adminTypes'

const emptyForm: CompetitionPayload = {
  name: '', slug: '', description: '', type: 'OLIMPIADE', payment_flow: 'UPFRONT', start_date: '', end_date: '', status: 'DRAFT',
}

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

export function CompetitionFormDialog({ open, onOpenChange, competition }: { open: boolean; onOpenChange: (open: boolean) => void; competition: AdminCompetition | null }) {
  const [form, setForm] = useState<CompetitionPayload>(emptyForm)
  const [localError, setLocalError] = useState('')
  const create = useCreateCompetition()
  const update = useUpdateCompetition()
  const mutation = competition ? update : create
  const apiError = mutation.error instanceof ApiClientError ? mutation.error : null

  useEffect(() => {
    if (!open) return
    setForm(competition ? {
      name: competition.name,
      slug: competition.slug,
      description: competition.description ?? '',
      type: competition.type,
      payment_flow: competition.paymentFlow,
      start_date: dateValue(competition.startDate),
      end_date: dateValue(competition.endDate),
      status: competition.status,
    } : emptyForm)
    setLocalError('')
    mutation.reset()
  }, [competition, open])

  function setField<K extends keyof CompetitionPayload>(key: K, value: CompetitionPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setLocalError('')
    mutation.reset()
  }

  async function submit() {
    if (!form.name.trim() || !form.type || !form.payment_flow || !form.start_date || !form.end_date) {
      setLocalError('Nama, tipe, payment flow, dan periode kompetisi wajib diisi.')
      return
    }
    if (form.end_date < form.start_date) {
      setLocalError('Tanggal selesai tidak boleh sebelum tanggal mulai.')
      return
    }

    try {
      if (competition) await update.mutateAsync({ id: competition.id, payload: form })
      else await create.mutateAsync(form)
      toast.success(competition ? 'Kompetisi berhasil diperbarui.' : 'Kompetisi berhasil dibuat.')
      onOpenChange(false)
    } catch {
      // Kesalahan API ditampilkan di bawah form.
    }
  }

  const fieldError = (field: string) => apiError?.fields[field]?.[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{competition ? 'Edit Kompetisi' : 'Buat Kompetisi'}</DialogTitle><DialogDescription>Informasi ini akan digunakan pada alur pendaftaran peserta.</DialogDescription></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm sm:col-span-2">Nama kompetisi<Input value={form.name} onChange={(event) => setField('name', event.target.value)} aria-invalid={Boolean(fieldError('name'))} />{fieldError('name') && <span className="text-xs text-destructive">{fieldError('name')}</span>}</label>
          <label className="space-y-1.5 text-sm">Slug<Input value={form.slug ?? ''} onChange={(event) => setField('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="otomatis-jika-kosong" aria-invalid={Boolean(fieldError('slug'))} />{fieldError('slug') && <span className="text-xs text-destructive">{fieldError('slug')}</span>}</label>
          <label className="space-y-1.5 text-sm">Tipe<select value={form.type} onChange={(event) => { const type = event.target.value as CompetitionPayload['type']; setForm((current) => ({ ...current, type, payment_flow: type === 'OLIMPIADE' ? 'UPFRONT' : 'SEMIFINAL' })); setLocalError(''); mutation.reset() }} className="h-9 w-full rounded-3xl border border-input bg-input/50 px-3"><option value="OLIMPIADE">Olimpiade</option><option value="BUSINESS_PLAN">Business Plan</option><option value="BUSINESS_IT_CASE">Business IT Case</option></select></label>
          <label className="space-y-1.5 text-sm">Payment flow<select value={form.payment_flow} onChange={(event) => setField('payment_flow', event.target.value as CompetitionPayload['payment_flow'])} className="h-9 w-full rounded-3xl border border-input bg-input/50 px-3"><option value="UPFRONT">Upfront</option><option value="SEMIFINAL">Semifinal</option></select></label>
          <label className="space-y-1.5 text-sm">Status<select value={form.status} onChange={(event) => setField('status', event.target.value as CompetitionPayload['status'])} className="h-9 w-full rounded-3xl border border-input bg-input/50 px-3"><option value="DRAFT">Draft</option><option value="REGISTRATION_OPEN">Pendaftaran Dibuka</option><option value="REGISTRATION_CLOSED">Pendaftaran Ditutup</option><option value="ONGOING">Berlangsung</option><option value="COMPLETED">Selesai</option></select></label>
          <label className="space-y-1.5 text-sm">Tanggal mulai<Input type="date" value={form.start_date} onChange={(event) => setField('start_date', event.target.value)} aria-invalid={Boolean(fieldError('start_date'))} /></label>
          <label className="space-y-1.5 text-sm">Tanggal selesai<Input type="date" value={form.end_date} onChange={(event) => setField('end_date', event.target.value)} aria-invalid={Boolean(fieldError('end_date'))} /></label>
          <label className="space-y-1.5 text-sm sm:col-span-2">Deskripsi<Textarea value={form.description ?? ''} onChange={(event) => setField('description', event.target.value)} /></label>
        </div>
        {(localError || mutation.error) && <p className="rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{localError || mutation.error?.message}</p>}
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button><Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? 'Menyimpan...' : 'Simpan Kompetisi'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
