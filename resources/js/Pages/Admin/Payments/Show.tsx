import { Link } from '@inertiajs/react'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileImage,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldX,
  Tag,
  Timer,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { AdminStatusBadge } from '@/features/admin/components/AdminStatusBadge'
import { AdminErrorState, AdminLoadingState } from '@/features/admin/components/AdminStates'
import { PaymentReviewDialog } from '@/features/admin/components/PaymentReviewDialog'
import { useAdminPayment } from '@/features/admin/hooks/useAdmin'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { cn } from '@/lib/utils'

function display(value: string | null | undefined) {
  return value || '—'
}

function formatCurrency(value: string | null | undefined) {
  if (!value || value === '0.00') return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
}

const paymentMethodLabels: Record<string, string> = {
  BANK_TRANSFER: 'Transfer Bank',
  QRIS: 'QRIS',
}

const paymentContextLabels: Record<string, string> = {
  REGISTRATION: 'Biaya Pendaftaran',
  SEMIFINAL: 'Biaya Semifinal',
}

type ReviewAction = 'verify' | 'revise' | 'reject'

export default function AdminPaymentShow({ registrationId }: { registrationId: string }) {
  const { principal } = useAuthSession()
  const query = useAdminPayment(registrationId)
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const data = query.data?.data
  const role = principal?.principalType === 'ADMIN' ? principal.admin.role : null
  const canMutate = role === 'super_admin' || role === 'admin_payment'

  if (query.isLoading) return <AdminLoadingState label="Memuat detail pembayaran..." />
  if (query.error || !data) return <AdminErrorState message={query.error?.message ?? 'Detail pembayaran tidak ditemukan.'} retry={() => query.refetch()} />

  const { team, competition, batch, payment } = data
  const proofUrl = payment.proof?.url ?? null

  return (
    <>
      <Seo title={`Pembayaran ${team.name ?? team.code} · Admin`} description="Detail verifikasi pembayaran tim ISAC 2026." canonical={`/admin/payments/${registrationId}`} noindex />
      <AdminPageHeader
        title={team.name ?? team.code}
        description={`${team.code} · ${competition.name} · ${paymentContextLabels[data.paymentContext] ?? data.paymentContext}`}
        action={<Link href="/admin/payments" className={cn(buttonVariants({ variant: 'outline' }))}><ArrowLeft />Kembali</Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Team identity */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle>Identitas Tim</CardTitle>
              <AdminStatusBadge status={team.status} />
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-secondary" /><div><p className="text-xs text-muted-foreground">Email</p><p>{display(team.email)}</p></div></div>
              <div className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-secondary" /><div><p className="text-xs text-muted-foreground">Telepon</p><p>{display(team.phone)}</p></div></div>
              <div className="flex gap-3"><Building2 className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-xs text-muted-foreground">Institusi</p><p>{display(team.institutionName)}</p></div></div>
              <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-xs text-muted-foreground">Alamat</p><p>{display(team.institutionAddress)}</p></div></div>
              {team.currentStage && (
                <div className="flex gap-3 sm:col-span-2"><UserRound className="mt-0.5 size-4 shrink-0 text-accent" /><div><p className="text-xs text-muted-foreground">Tahapan saat ini</p><p>{team.currentStage.name}</p></div></div>
              )}
            </CardContent>
          </Card>

          {/* Competition & Batch */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader><CardTitle>Kompetisi & Batch</CardTitle></CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Kompetisi</p><p className="mt-1 font-medium">{competition.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Tipe</p><p className="mt-1">{competition.type.replace(/_/g, ' ')}</p></div>
              <div><p className="text-xs text-muted-foreground">Batch</p><p className="mt-1">{batch.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Harga batch</p><p className="mt-1">{formatCurrency(batch.price)}</p></div>
              <div><p className="text-xs text-muted-foreground">Konteks pembayaran</p><p className="mt-1">{paymentContextLabels[data.paymentContext] ?? data.paymentContext}</p></div>
              {payment.targetStage && (
                <div className="flex items-center gap-2"><ArrowRight className="size-4 shrink-0 text-secondary" /><div><p className="text-xs text-muted-foreground">Target tahapan</p><p className="mt-1">{payment.targetStage.name}</p></div></div>
              )}
            </CardContent>
          </Card>

          {/* Payment breakdown */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader><CardTitle>Rincian Pembayaran</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Harga dasar</p><p className="mt-1 font-medium">{formatCurrency(payment.originalAmount)}</p></div>
                <div><p className="text-xs text-muted-foreground">Metode</p><p className="mt-1">{payment.method ? paymentMethodLabels[payment.method] ?? payment.method : '—'}</p></div>
                {payment.promoCode && (
                  <>
                    <div className="flex items-center gap-2"><Tag className="size-3.5 shrink-0 text-accent" /><div><p className="text-xs text-muted-foreground">Kode promo</p><p className="mt-1 font-mono text-accent">{payment.promoCode}</p></div></div>
                    <div><p className="text-xs text-muted-foreground">Diskon</p><p className="mt-1 text-accent">{payment.discountPercent}% · {formatCurrency(payment.discountAmount)}</p></div>
                  </>
                )}
                <div className="rounded-2xl border border-border bg-background/30 p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Nominal dibayar</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{data.isSubmitted ? formatCurrency(payment.amountPaid) : <span className="text-base text-muted-foreground">Belum mengirim bukti</span>}</p>
                </div>
              </div>

              {/* Proof of payment */}
              {proofUrl ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Bukti Pembayaran</p>
                  {!previewError ? (
                    <div className="overflow-hidden rounded-2xl border border-border bg-background/30">
                      <img
                        src={proofUrl}
                        alt="Bukti pembayaran"
                        className="max-h-80 w-full object-contain"
                        onError={() => setPreviewError(true)}
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/20 text-center">
                      <FileImage className="size-7 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Preview tidak tersedia</p>
                    </div>
                  )}
                  <a href={proofUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}>
                    <span className="flex items-center gap-2"><FileImage className="size-4" />Buka File Asli</span>
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              ) : (
                <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/20 text-center">
                  <FileImage className="size-7 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Bukti pembayaran belum diunggah</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Registration status & timeline */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle>Status Pembayaran</CardTitle>
              <AdminStatusBadge status={data.status} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-3">
                <TimelineItem icon={Timer} label="Pembayaran diwajibkan" value={formatDate(payment.requiredAt)} active={Boolean(payment.requiredAt)} />
                <TimelineItem icon={Banknote} label="Bukti dikirim" value={formatDate(payment.submittedAt)} active={Boolean(payment.submittedAt)} />
                <TimelineItem icon={CheckCircle2} label="Ditinjau" value={formatDate(payment.reviewedAt)} active={Boolean(payment.reviewedAt)} />
                <TimelineItem icon={CheckCircle2} label="Dibayar" value={formatDate(payment.paidAt)} active={Boolean(payment.paidAt)} tone="accent" />
              </div>
              {payment.reviewedBy && (
                <div className="mt-1 rounded-2xl border border-border bg-background/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">Diperiksa oleh</p>
                  <p className="mt-0.5 font-medium">{payment.reviewedBy.name}</p>
                </div>
              )}
              {payment.rejectionReason && (
                <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-3 text-amber-200">
                  <p className="text-xs font-medium">Catatan revisi / penolakan</p>
                  <p className="mt-1 text-sm">{payment.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review actions */}
          <Card className="border-border/60 bg-card/70 backdrop-blur-md">
            <CardHeader><CardTitle>Keputusan Review</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!canMutate ? (
                <p className="text-sm text-muted-foreground">Role Anda hanya dapat melihat detail pembayaran.</p>
              ) : !data.canBeReviewed ? (
                <p className="text-sm text-muted-foreground">
                  {!data.isSubmitted
                    ? 'Tim belum mengirimkan bukti pembayaran.'
                    : 'Aksi review hanya tersedia ketika pembayaran berstatus Menunggu Verifikasi.'}
                </p>
              ) : (
                <>
                  <Button className="w-full" onClick={() => setReviewAction('verify')}>
                    <CheckCircle2 />Verifikasi Pembayaran
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setReviewAction('revise')}>
                    <RotateCcw />Minta Revisi
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => setReviewAction('reject')}>
                    <ShieldX />Tolak Pembayaran
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {reviewAction && (
        <PaymentReviewDialog
          registrationId={registrationId}
          action={reviewAction}
          open
          onOpenChange={(open) => { if (!open) setReviewAction(null) }}
        />
      )}
    </>
  )
}

function TimelineItem({ icon: Icon, label, value, active, tone = 'secondary' }: { icon: React.ElementType; label: string; value: string; active: boolean; tone?: 'secondary' | 'accent' }) {
  const toneClass = tone === 'accent' ? 'text-accent' : 'text-secondary'
  return (
    <div className="flex items-center gap-3">
      <Icon className={cn('size-4 shrink-0', active ? toneClass : 'text-muted-foreground/40')} />
      <div className="flex-1">
        <p className={cn('text-xs', active ? 'text-muted-foreground' : 'text-muted-foreground/40')}>{label}</p>
        <p className={cn('text-sm', active ? 'text-foreground' : 'text-muted-foreground/40')}>{value}</p>
      </div>
    </div>
  )
}

AdminPaymentShow.layout = adminPageLayout
