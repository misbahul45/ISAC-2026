import React, { useState, useRef, useCallback } from 'react'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'
import FormMember from '../../features/registrations/components/FormMember'
import { MemberFormData } from '../../features/registrations/schemas/createTeamMember'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { router } from '@inertiajs/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface MemberData {
  id: number
  role: string
  isActive: boolean
}

const Biodata = () => {
  const [competitionType] = useState<'OLIMPIADE' | 'BUSINESS_PLAN' | 'BUSINESS_IT_CASE'>('BUSINESS_IT_CASE')
  const isOlimpiade = competitionType === 'OLIMPIADE'

  const initialMembers: MemberData[] = isOlimpiade
    ? [{ id: 1, role: 'Ketua Tim', isActive: true }]
    : [
        { id: 1, role: 'Ketua Tim', isActive: true },
        { id: 2, role: 'Anggota 1', isActive: false },
        { id: 3, role: 'Anggota 2', isActive: false },
      ]

  const [members, setMembers] = useState<MemberData[]>(initialMembers)
  const [activeIndex, setActiveIndex] = useState(0)
  const [savedData, setSavedData] = useState<Record<number, MemberFormData>>({})
  const [validState, setValidState] = useState<Record<number, boolean>>({})
  const [allCompleted, setAllCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
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
  }, { scope: mobileRef })

  const handleFocus = (index: number) => {
    if (allCompleted) return
    setActiveIndex(index)
    setMembers(prev => prev.map((m, i) => ({ ...m, isActive: i === index })))
  }

  const goNext = () => {
    if (allCompleted) return
    const next = (activeIndex + 1) % members.length
    setActiveIndex(next)
    setMembers(prev => prev.map((m, i) => ({ ...m, isActive: i === next })))
  }

  const goPrev = () => {
    if (allCompleted) return
    const prevIndex = (activeIndex - 1 + members.length) % members.length
    setActiveIndex(prevIndex)
    setMembers(prevMembers => prevMembers.map((m, i) => ({ ...m, isActive: i === prevIndex })))
  }

  const scrollToSubmitButton = () => {
    setTimeout(() => {
      submitButtonRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 300)
  }

  const handleSave = (memberId: number) => (data: MemberFormData) => {
    setSavedData(prev => ({ ...prev, [memberId]: data }))
    setValidState(prev => ({ ...prev, [memberId]: true }))
    toast.success(`${members.find(m => m.id === memberId)?.role} berhasil disimpan!`)

    const currentIndex = members.findIndex(m => m.id === memberId)
    const nextIndex = members.findIndex((m, i) => i > currentIndex && !savedData[m.id])

    if (nextIndex !== -1) {
      setActiveIndex(nextIndex)
      setMembers(prev => prev.map((m, i) => ({ ...m, isActive: i === nextIndex })))
    } else {
      const firstEmpty = members.findIndex((m, i) => i !== currentIndex && !savedData[m.id])
      if (firstEmpty !== -1) {
        setActiveIndex(firstEmpty)
        setMembers(prev => prev.map((m, i) => ({ ...m, isActive: i === firstEmpty })))
      } else {
        scrollToSubmitButton()
      }
    }
  }

  const handleValidationChange = (memberId: number, isValid: boolean) => {
    setValidState(prev => ({ ...prev, [memberId]: isValid }))
  }

  const allMembersValid = members.every(m => validState[m.id])

  const handleComplete = useCallback(() => {
    if (!allMembersValid) {
      toast.error('Masih ada data yang belum valid!')
      return
    }

    setIsSubmitting(true)
    toast.loading('Menyimpan data ke database...')

    setTimeout(() => {
      members.forEach(m => localStorage.removeItem(`biodata-member-${m.id}`))
      setAllCompleted(true)
      setMembers(prev => prev.map(m => ({ ...m, isActive: false })))
      setIsSubmitting(false)
      toast.dismiss()
      toast.success('Semua data berhasil disimpan ke database!')

      setTimeout(() => {
        router.visit('/registration/documents')
      }, 1500)
    }, 2500)
  }, [members, allMembersValid])

  const getLayoutTransform = (index: number) => {
    if (!allCompleted) {
      const offset = (index - activeIndex) * 110
      const scale = index === activeIndex ? 1.05 : 0.9
      const translateY = index === activeIndex ? -30 : 30
      const opacity = Math.abs(index - activeIndex) > 1 ? 0 : 1
      return {
        transform: `translateX(${offset}%) translateY(${translateY}px) scale(${scale})`,
        zIndex: index === activeIndex ? 10 : 1,
        opacity,
      }
    }

    if (members.length === 1) {
      return {
        transform: 'translateX(0) translateY(0) scale(1)',
        zIndex: 1,
        opacity: 1,
      }
    }

    if (members.length === 2) {
      const positions = [-50, 50]
      return {
        transform: `translateX(${positions[index]}%) translateY(0) scale(1)`,
        zIndex: 1,
        opacity: 1,
      }
    }

    const positions = [-100, 0, 100]
    return {
      transform: `translateX(${positions[index]}%) translateY(0) scale(1)`,
      zIndex: 1,
      opacity: 1,
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 text-center text-primary-foreground">
      {/* Desktop: 3D Carousel */}
      <div className="hidden md:flex items-center justify-center gap-4">
        <button
          onClick={goPrev}
          disabled={allCompleted || members.length <= 1}
          className="relative z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border-2 border-border text-white hover:bg-card hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={containerRef}
          className="relative flex justify-center items-center gap-6 min-h-[600px] perspective-[1000px] w-full max-w-4xl"
        >
          {members.map((member, index) => (
            <div
              key={member.id}
              className="absolute w-full max-w-lg transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform"
              style={getLayoutTransform(index)}
            >
              <div className="relative bg-background/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-2xl shadow-secondary/30">
                <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
                <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />

                <h3 className="text-xl font-semibold mb-4 relative z-10">{member.role}</h3>
                <FormMember
                  memberId={member.id}
                  onFocus={() => handleFocus(index)}
                  onSave={handleSave(member.id)}
                  onValidationChange={(isValid) => handleValidationChange(member.id, isValid)}
                  showSubmit={!allCompleted}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={allCompleted || members.length <= 1}
          className="relative z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border-2 border-border text-white hover:bg-card hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile: Vertical Stack */}
      <div ref={mobileRef} className="md:hidden space-y-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="mobile-card relative bg-background/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-lg shadow-secondary/20"
          >
            <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
            <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />

            <h3 className="text-lg font-semibold mb-4 relative z-10">{member.role}</h3>
            <FormMember
              memberId={member.id}
              onSave={handleSave(member.id)}
              onValidationChange={(isValid) => handleValidationChange(member.id, isValid)}
              showSubmit={!allCompleted}
            />
          </div>
        ))}
      </div>

      <div className="mt-12 pb-8">
        {!allCompleted ? (
          <button
            ref={submitButtonRef}
            onClick={handleComplete}
            disabled={!allMembersValid || isSubmitting}
            className="px-10 py-4 rounded-xl cursor-pointer bg-primary text-white font-bold text-lg hover:bg-primary/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              'Simpan Semua Anggota ke Tim'
            )}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="flex gap-4 items-center">
              <div className="p-4 rounded-full bg-green-500/20 border border-green-500/50">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 font-medium">Data berhasil disimpan!</p>
            </div>
            <p className="text-muted-foreground text-sm">Mengalihkan ke halaman dokumen...</p>
          </div>
        )}
      </div>
    </div>
  )
}

Biodata.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi - Biodata"
    description="Lengkapi biodata peserta untuk melanjutkan proses pendaftaran."
  >
    {page}
  </RegistrationLayout>
)

export default Biodata