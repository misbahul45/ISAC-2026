import { Link } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, Eye, FilterX, Search } from 'lucide-react'
import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminStatusBadge } from '@/features/admin/components/AdminStatusBadge'
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from '@/features/admin/components/AdminStates'
import { adminPageLayout } from '@/features/admin/components/AdminShell'
import { useAdminBatches, useAdminCompetitions, useAdminPayments } from '@/features/admin/hooks/useAdmin'
import type { AdminPaymentFilters, PaymentMethod } from '@/features/admin/types/adminTypes'
import type { RegistrationStatus } from '@/features/registrations/types/registrationTypes'
import { cn } from '@/lib/utils'

const registrationStatuses: RegistrationStatus[] = ['WAITING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED', 'REVISION_REQUIRED', 'REJECTED', 'CANCELLED']
const paymentMethods: PaymentMethod[] = ['BANK_TRANSFER', 'QRIS']

const paymentMethodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Transfer Bank',
  QRIS: 'QRIS',
}

function formatCurrency(value: string | null | undefined) {
  if (!value || value === '0.00') return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function AdminPayments() {
  const [filters, setFilters] = useState<AdminPaymentFilters>({ page: 1, per_page: 15 })
  const paymentsQuery = useAdminPayments(filters)
  const competitionsQuery = useAdminCompetitions({ perPage: 100 })
  const batchesQuery = useAdminBatches(filters.competition_id)
  const pagination = paymentsQuery.data?.data
  const payments = pagination?.data ?? []

  function updateFilter<K extends keyof AdminPaymentFilters>(key: K, value: AdminPaymentFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value, page: 1, ...(key === 'competition_id' ? { batch_id: '' } : {}) }))
  }

  function resetFilters() {
    setFilters({ page: 1, per_page: 15 })
  }

  return (
    <>
      <Seo title="Verifikasi Pembayaran Admin" description="Antrean dan status pembayaran tim ISAC 2026." canonical="/admin/payments" noindex />
      <AdminPageHeader title="Verifikasi Pembayaran" description="Filter berdasarkan status, kompetisi, batch, atau metode pembayaran, lalu buka detail untuk melakukan review." />

      <Card className="mb-5 border-border/60 bg-card/70 backdrop-blur-md">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <label className="space-y-1.5 text-xs text-muted-foreground sm:col-span-2 xl:col-span-1">Cari tim
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.search ?? ''}
                onChange={(event) => updateFilter('search', event.target.value || undefined)}
                placeholder="Kode, nama, email, institusi..."
                className="h-10 rounded-3xl pl-8"
              />
            </div>
          </label>
          <label className="space-y-1.5 text-xs text-muted-foreground">Status
            <select value={filters.status ?? ''} onChange={(event) => updateFilter('status', event.target.value as RegistrationStatus | '')} className="h-10 w-full rounded-3xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Semua status</option>
              {registrationStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
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
          <label className="space-y-1.5 text-xs text-muted-foreground">Metode
            <select value={filters.payment_method ?? ''} onChange={(event) => updateFilter('payment_method', event.target.value as PaymentMethod | '')} className="h-10 w-full rounded-3xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Semua metode</option>
              {paymentMethods.map((method) => <option key={method} value={method}>{paymentMethodLabels[method]}</option>)}
            </select>
          </label>
          <Button variant="outline" className="self-end" onClick={resetFilters}><FilterX />Reset</Button>
        </CardContent>
      </Card>

      {paymentsQuery.isLoading ? (
        <AdminLoadingState label="Memuat antrean pembayaran..." />
      ) : paymentsQuery.error ? (
        <AdminErrorState message={paymentsQuery.error.message} retry={() => paymentsQuery.refetch()} />
      ) : payments.length === 0 ? (
        <AdminEmptyState title="Tidak ada pembayaran" description="Belum ada pembayaran yang sesuai dengan filter aktif." />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden border-border/60 bg-card/70 backdrop-blur-md md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tim</TableHead>
                  <TableHead>Kompetisi / Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Dikirim</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((item) => (
                  <TableRow key={item.registrationId}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.team.name ?? 'Belum dilengkapi'}</p>
                        <p className="text-xs text-muted-foreground">{item.team.code} · {item.team.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{item.competition.name}</p>
                        <p className="text-xs text-muted-foreground">{item.batch.name}</p>
                      </div>
                    </TableCell>
                    <TableCell><AdminStatusBadge status={item.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.isSubmitted && item.payment.method ? paymentMethodLabels[item.payment.method] : '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.isSubmitted ? formatCurrency(item.payment.amountPaid) : <span className="text-xs text-muted-foreground">Belum mengirim bukti</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(item.payment.submittedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/payments/${item.registrationId}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                        <Eye />Detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {payments.map((item) => (
              <Card key={item.registrationId} className="border-border/60 bg-card/70">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.team.name ?? 'Belum dilengkapi'}</p>
                      <p className="text-xs text-muted-foreground">{item.team.code} · {item.team.institutionName ?? 'Institusi belum diisi'}</p>
                    </div>
                    <AdminStatusBadge status={item.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Kompetisi</p>
                      <p className="mt-1">{item.competition.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nominal</p>
                      <p className="mt-1">{item.isSubmitted ? formatCurrency(item.payment.amountPaid) : <span className="text-muted-foreground">Belum dikirim</span>}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Metode</p>
                      <p className="mt-1">{item.isSubmitted && item.payment.method ? paymentMethodLabels[item.payment.method] : '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dikirim</p>
                      <p className="mt-1">{formatDate(item.payment.submittedAt)}</p>
                    </div>
                  </div>
                  <Link href={`/admin/payments/${item.registrationId}`} className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
                    <Eye />Lihat Detail
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
              <p>Menampilkan {pagination.meta.from ?? 0}–{pagination.meta.to ?? 0} dari {pagination.meta.total} pembayaran</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pagination.meta.current_page <= 1} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}>
                  <ChevronLeft />Sebelumnya
                </Button>
                <span className="px-2">{pagination.meta.current_page} / {pagination.meta.last_page}</span>
                <Button variant="outline" size="sm" disabled={pagination.meta.current_page >= pagination.meta.last_page} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}>
                  Berikutnya<ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

AdminPayments.layout = adminPageLayout
