import React from 'react'
import { router } from '@inertiajs/react'
import { ArrowRight, Clock3 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import RegistrationLayout from '@/features/registrations/components/RegistrationLayout'
import { useCompetitions, useRegistrationContext, useSelectCompetition } from '@/features/registrations/hooks/useRegistration'
import type { CompetitionSummary } from '@/features/registrations/types/registrationTypes'

export default function RegistrationCompetition() {
  const competitionsQuery = useCompetitions({ status: 'REGISTRATION_OPEN' })
  const selectCompetition = useSelectCompetition()
  const contextQuery = useRegistrationContext()
  const competitions = competitionsQuery.data?.data ?? []
  const handleSelect = async (competition: CompetitionSummary) => {
  const selectedCompetitionId = contextQuery.data?.data.registration?.competition.id
    try {
      const response = await selectCompetition.mutateAsync({
        competition_id: competition.id,
      })
      toast.success(`${competition.name} berhasil dipilih.`)
      router.visit(response.data.redirectTo, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kompetisi gagal dipilih. Coba lagi saat Batch pendaftaran aktif.')
    }
  }

  if (competitionsQuery.isLoading) {
    return <div className="relative z-10 mx-auto w-full max-w-6xl space-y-5 px-4 py-10" role="status" aria-label="Memuat kompetisi"><Skeleton className="mx-auto h-14 max-w-2xl bg-card/70" /><div className="grid gap-5 md:grid-cols-3"><Skeleton className="h-72 bg-card/70" /><Skeleton className="h-72 bg-card/70" /><Skeleton className="h-72 bg-card/70" /></div></div>
  }

  if (competitionsQuery.error || competitions.length === 0) {
    return <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 text-center"><Card className="border border-dashed border-white/15 bg-card/55 backdrop-blur-xl"><CardContent className="px-6 py-12"><Clock3 className="mx-auto size-9 text-muted-foreground" /><h1 className="mt-4 text-xl font-bold">Pendaftaran belum tersedia</h1><p className="mt-2 text-sm text-muted-foreground">{competitionsQuery.error?.message ?? 'Belum ada Competition yang membuka pendaftaran.'}</p>{competitionsQuery.error && <Button variant="outline" className="mt-6" onClick={() => competitionsQuery.refetch()}>Coba Lagi</Button>}</CardContent></Card></div>
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 py-10 text-primary-foreground sm:py-14">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{selectedCompetitionId ? 'Kompetisi pilihan' : 'Pilih kompetisi'}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{selectedCompetitionId ? 'Pilihan kompetisi sudah tersimpan bersama Batch pendaftaran dan tidak dapat diubah.' : 'Pilih salah satu kompetisi ISAC 2026 untuk melanjutkan pendaftaran.'}</p>
      </header>

      <section className="grid gap-5 md:grid-cols-3" aria-label="Pilihan kompetisi">
        {competitions.map((competition) => {
          const isSelected = selectedCompetitionId === competition.id
          const isSelectionLocked = Boolean(selectedCompetitionId)

          return <Card key={competition.id} className="relative overflow-hidden border border-white/10 bg-card/55 shadow-xl shadow-black/15 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"><span aria-hidden="true" className="header-border-track" /><span aria-hidden="true" className="header-border-spin" /><CardContent className="relative z-10 flex min-h-72 flex-col p-6"><p className="text-xs font-semibold tracking-[0.14em] text-secondary">{competition.type.replace(/_/g, ' ')}</p><h2 className="mt-4 text-2xl font-bold text-foreground">{competition.name}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{competition.description ?? 'Kompetisi ISAC 2026.'}</p><Button className="mt-auto w-full justify-between" size="lg" disabled={selectCompetition.isPending || isSelectionLocked} onClick={() => handleSelect(competition)}>{isSelected ? 'Lomba dipilih' : isSelectionLocked ? 'Pilihan dikunci' : selectCompetition.isPending ? 'Menyimpan pilihan...' : 'Pilih lomba'}<ArrowRight /></Button></CardContent></Card>
        })}
      </section>
    </div>
  )
}

RegistrationCompetition.layout = (page: React.ReactNode) => (
  <RegistrationLayout title="Registrasi" description="Pilih kompetisi ISAC 2026 untuk memulai pendaftaran.">{page}</RegistrationLayout>
)
