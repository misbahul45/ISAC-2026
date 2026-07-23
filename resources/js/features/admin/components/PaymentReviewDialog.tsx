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
import { useRejectAdminPayment, useReviseAdminPayment, useVerifyAdminPayment } from '../hooks/useAdmin'

type ReviewAction = 'verify' | 'revise' | 'reject'

const copy = {
  verify: { title: 'Verifikasi pembayaran?', description: 'Pastikan bukti pembayaran dan nominal telah sesuai. Tim akan diaktifkan atau dipindahkan ke tahapan selanjutnya.', confirm: 'Verifikasi Pembayaran' },
  revise: { title: 'Minta revisi pembayaran', description: 'Berikan catatan yang jelas agar tim dapat mengirim ulang bukti pembayaran yang benar.', confirm: 'Kirim Permintaan Revisi' },
  reject: { title: 'Tolak pembayaran?', description: 'Alasan penolakan akan ditampilkan kepada tim dan tersimpan pada audit.', confirm: 'Tolak Pembayaran' },
} as const

export function PaymentReviewDialog({ registrationId, action, open, onOpenChange }: { registrationId: string; action: ReviewAction; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [note, setNote] = useState('')
  const verify = useVerifyAdminPayment(registrationId)
  const revise = useReviseAdminPayment(registrationId)
  const reject = useRejectAdminPayment(registrationId)
  const mutation = action === 'verify' ? verify : action === 'revise' ? revise : reject

  function reset() {
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
      if (action === 'revise') await revise.mutateAsync(note.trim())
      if (action === 'reject') await reject.mutateAsync(note.trim())
      toast.success(action === 'verify' ? 'Pembayaran berhasil diverifikasi.' : action === 'revise' ? 'Permintaan revisi berhasil dikirim.' : 'Pembayaran berhasil ditolak.')
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
