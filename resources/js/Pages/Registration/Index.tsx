import React, { useState, useRef } from 'react'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'
import { COMPETITIONS } from '@/constants/registration'
import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'

const Index = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const goNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev + 1) % COMPETITIONS.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goPrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev - 1 + COMPETITIONS.length) % COMPETITIONS.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleSelect = (competitionName: string) => {
    router.visit(`/registration/team?selected_competition=${encodeURIComponent(competitionName)}`)
  }

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex
    const normalizedDiff = ((diff + COMPETITIONS.length) % COMPETITIONS.length)
    const adjustedDiff = normalizedDiff > COMPETITIONS.length / 2 ? normalizedDiff - COMPETITIONS.length : normalizedDiff

    const isActive = adjustedDiff === 0
    const isPrev = adjustedDiff === -1 || (adjustedDiff === COMPETITIONS.length - 1 && COMPETITIONS.length > 2)
    const isNext = adjustedDiff === 1 || (adjustedDiff === -(COMPETITIONS.length - 1) && COMPETITIONS.length > 2)

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-center text-primary-foreground">
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
          {COMPETITIONS.map((competition, index) => {
            const isActive = index === activeIndex

            return (
              <div
                key={competition.id}
                className="absolute w-full max-w-sm cursor-pointer"
                style={getCardStyle(index)}
                onClick={() => isActive && handleSelect(competition.name)}
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelect(competition.name)
                      }}
                    >
                      Register
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
        {COMPETITIONS.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full transition-all cursor-pointer ${index === activeIndex ? 'bg-primary w-8' : 'bg-border hover:bg-primary/50'}`}
          />
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