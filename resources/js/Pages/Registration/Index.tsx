import React, { useRef, useState } from 'react'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'
import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { toast } from 'sonner'
import {
  useCompetitions,
  useSelectCompetition,
} from '@/features/registrations/hooks/useRegistration'

const Index = () => {
  const competitionsQuery = useCompetitions({
    status: 'REGISTRATION_OPEN',
  })
  const selectCompetitionMutation = useSelectCompetition()
  const competitions = competitionsQuery.data?.data ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!mobileRef.current) return
    const cards = mobileRef.current.querySelectorAll('.mobile-card')
    gsap.from(cards, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    })
  }, { scope: mobileRef, dependencies: [competitions.length] })

  const goNext = () => {
    if (isAnimating || competitions.length === 0) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev + 1) % competitions.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goPrev = () => {
    if (isAnimating || competitions.length === 0) return
    setIsAnimating(true)
    setActiveIndex(
      (prev) => (prev - 1 + competitions.length) % competitions.length,
    )
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleSelect = async (competitionId: string) => {
    const competition = competitions.find((item) => item.id === competitionId)
    const batchId = competition?.openBatches[0]?.id

    if (!batchId) return

    try {
      const response = await selectCompetitionMutation.mutateAsync({
        competition_id: competitionId,
        batch_id: batchId,
      })
      router.visit(response.data.redirectTo)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memilih competition')
    }
  }

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex
    const normalizedDiff =
      (diff + competitions.length) % competitions.length
    const adjustedDiff =
      normalizedDiff > competitions.length / 2
        ? normalizedDiff - competitions.length
        : normalizedDiff
    const isActive = adjustedDiff === 0
    const isPrev =
      adjustedDiff === -1 ||
      (adjustedDiff === competitions.length - 1 && competitions.length > 2)
    const isNext =
      adjustedDiff === 1 ||
      (adjustedDiff === -(competitions.length - 1) &&
        competitions.length > 2)
    let transform = 'translateX(0) scale(0.8) rotateY(0deg)'
    let zIndex = 1
    let opacity = 0

    if (isActive) {
      transform = 'translateX(0) scale(1.1) rotateY(0deg)'
      zIndex = 10
      opacity = 1
    } else if (isPrev) {
      transform = 'translateX(-120%) scale(0.85) rotateY(25deg)'
      zIndex = 5
      opacity = 0.7
    } else if (isNext) {
      transform = 'translateX(120%) scale(0.85) rotateY(-25deg)'
      zIndex = 5
      opacity = 0.7
    }

    return {
      transform,
      zIndex,
      opacity,
      transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
    }
  }

  if (competitionsQuery.isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 text-center text-primary-foreground">
        Memuat competition...
      </div>
    )
  }

  if (competitionsQuery.error || competitions.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 text-center text-primary-foreground">
        {competitionsQuery.error?.message ??
          'Belum ada competition yang membuka pendaftaran.'}
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-center text-primary-foreground">
      <div className="hidden md:block">
        <div className="relative flex items-center justify-center gap-4 min-h-[500px] perspective-[1200px]">
          <button
            onClick={goPrev}
            className="relative z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border-2 border-border text-white hover:bg-card hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/20 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            ref={containerRef}
            className="relative flex justify-center items-center w-full max-w-4xl h-[450px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {competitions.map((competition, index) => {
              const isActive = index === activeIndex

              return (
                <div
                  key={competition.id}
                  className="absolute w-full max-w-sm shadow-2xl shadow-primary/20 bg-background/40"
                  style={getCardStyle(index)}
                >
                  <div className={`relative flex h-full flex-col rounded-2xl border-2 p-6 text-center text-primary-foreground transition-all duration-300 ${isActive ? 'border-primary bg-card/60 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(139,92,255,0.4)]' : 'border-border/50 bg-card/30 backdrop-blur-sm'}`}>
                    <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
                    <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col h-full">
                      <h2 className="mb-4 text-2xl font-bold lg:text-3xl">
                        {competition.name}
                      </h2>
                      <p className="flex-1 text-sm md:text-base text-primary-foreground/80">
                        {competition.description}
                      </p>
                      <Button
                        className="mt-6 w-full rounded-xl font-semibold bg-primary hover:bg-primary/80 text-white"
                        disabled={
                          competition.openBatches.length === 0 ||
                          selectCompetitionMutation.isPending
                        }
                        onClick={() => handleSelect(competition.id)}
                      >
                        {selectCompetitionMutation.isPending
                          ? 'Memproses...'
                          : 'Register'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={goNext}
            className="relative z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border-2 border-border text-white hover:bg-card hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/20 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {competitions.map((competition, index) => (
            <button
              key={competition.id}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${index === activeIndex ? 'bg-primary w-8' : 'bg-border hover:bg-primary/50'}`}
            />
          ))}
        </div>
      </div>

      <div ref={mobileRef} className="md:hidden space-y-6">
        {competitions.map((competition) => (
          <div
            key={competition.id}
            className="mobile-card relative flex flex-col rounded-2xl border-2 border-border/50 bg-card/60 backdrop-blur-md p-6 text-center text-primary-foreground shadow-lg shadow-primary/10"
          >
            <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
            <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col">
              <h2 className="mb-3 text-xl font-bold">{competition.name}</h2>
              <p className="text-sm text-primary-foreground/80 mb-6">
                {competition.description}
              </p>
              <Button
                className="mt-6 w-full rounded-xl font-semibold bg-primary hover:bg-primary/80 text-white py-3"
                disabled={
                  competition.openBatches.length === 0 ||
                  selectCompetitionMutation.isPending
                }
                onClick={() => handleSelect(competition.id)}
              >
                {selectCompetitionMutation.isPending
                  ? 'Memproses...'
                  : 'Register'}
              </Button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

Index.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi"
    description="Pilih kategori lomba yang ingin Anda ikuti untuk memulai proses pendaftaran."
  >
    {page}
  </RegistrationLayout>
)

export default Index
