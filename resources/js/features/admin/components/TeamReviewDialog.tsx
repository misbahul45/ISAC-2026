import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useRejectAdminTeam, useReviseAdminTeam, useVerifyAdminTeam } from '../hooks/useAdmin'

type ReviewAction = 'verify' | 'revise' | 'reject'

const copy = {
  verify: { title: 'Verifikasi data tim?', description: 'Pastikan profil, peserta, dan dokumen sudah sesuai sebelum melanjutkan.', confirm: 'Verifikasi Tim' },
  revise: { title: 'Minta revisi data', description: 'Pilih bagian yang perlu diperbaiki dan berikan catatan yang jelas.', confirm: 'Kirim Permintaan Revisi' },
  reject: { title: 'Tolak pendaftaran tim?', description: 'Alasan penolakan akan ditampilkan kepada tim dan tersimpan pada audit.', confirm: 'Tolak Tim' },
} as const

export function TeamReviewDialog({ teamId, action, open, onOpenChange }: { teamId: string; action: ReviewAction; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<'TEAM' | 'MEMBERS' | 'DOCUMENTS'>('TEAM')
  const [note, setNote] = useState('')
  const verify = useVerifyAdminTeam(teamId)
  const revise = useReviseAdminTeam(teamId)
  const reject = useRejectAdminTeam(teamId)
  const mutation = action === 'verify' ? verify : action === 'revise' ? revise : reject

  function reset() {
    setStep('TEAM')
    setNote('')
    verify.reset()
    revise.reset()
    reject.reset()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  async function submit() {
    try {
      if (action === 'verify') await verify.mutateAsync()
      if (action === 'revise') await revise.mutateAsync({ revision_step: step, verification_note: note.trim() })
      if (action === 'reject') await reject.mutateAsync(note.trim())
      toast.success(action === 'verify' ? 'Data tim berhasil diverifikasi.' : action === 'revise' ? 'Permintaan revisi berhasil dikirim.' : 'Pendaftaran tim berhasil ditolak.')
      handleOpenChange(false)
    } catch {
      // Pesan mutation ditampilkan pada dialog.
    }
  }

  const requiresNote = action !== 'verify'
  const invalid = requiresNote && note.trim().length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{copy[action].title}</DialogTitle><DialogDescription>{copy[action].description}</DialogDescription></DialogHeader>
        {action === 'revise' && (
          <label className="space-y-1.5 text-sm">Bagian yang perlu direvisi
            <select value={step} onChange={(event) => { setStep(event.target.value as typeof step); revise.reset() }} className="h-10 w-full rounded-3xl border border-input bg-background/60 px-3 text-foreground outline-none focus:border-primary">
              <option value="TEAM">Profil Tim</option><option value="MEMBERS">Biodata Peserta</option><option value="DOCUMENTS">Dokumen</option>
            </select>
          </label>
        )}
        {requiresNote && (
          <label className="space-y-1.5 text-sm">{action === 'reject' ? 'Alasan penolakan' : 'Catatan revisi'}
            <Textarea value={note} onChange={(event) => { setNote(event.target.value); mutation.reset() }} placeholder="Tuliskan catatan yang spesifik dan mudah dipahami..." maxLength={2000} aria-invalid={Boolean(mutation.error)} />
            <span className="block text-right text-xs text-muted-foreground">{note.length}/2000</span>
          </label>
        )}
        {mutation.error && <p className="rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{mutation.error.message}</p>}
        <DialogFooter><Button variant="outline" onClick={() => handleOpenChange(false)}>Batal</Button><Button variant={action === 'reject' ? 'destructive' : 'default'} onClick={submit} disabled={mutation.isPending || invalid}>{mutation.isPending ? 'Memproses...' : copy[action].confirm}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

