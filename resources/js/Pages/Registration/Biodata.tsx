import React, { useCallback, useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import RegistrationLayout from '@/features/registrations/components/RegistrationLayout'
import FormMember from '@/features/registrations/components/FormMember'
import { useFinalizeMembers, useMembers } from '@/features/registrations/hooks/useRegistration'
import type { CompetitionType, MemberFormValues, MemberRole } from '@/features/registrations/types/registrationTypes'

interface MemberSlot {
  key: number
  role: MemberRole
  label: string
}

const createSlots = (count: number, competitionType: CompetitionType): MemberSlot[] =>
  Array.from({ length: count }, (_, index) => ({
    key: index + 1,
    role: index === 0 ? 'LEADER' : 'MEMBER',
    label: competitionType === 'OLIMPIADE'
      ? 'Peserta Olimpiade'
      : index === 0
        ? 'Ketua Tim'
        : `Anggota ${index}`,
  }))

const Biodata = () => {
  const membersQuery = useMembers()
  const finalizeMembers = useFinalizeMembers()
  const pageData = membersQuery.data?.data
  const [members, setMembers] = useState<MemberSlot[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [savedData, setSavedData] = useState<Record<number, MemberFormValues>>({})
  const [validState, setValidState] = useState<Record<number, boolean>>({})
  const submitButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!pageData) return
    const count = pageData.maxMembers
    const slots = createSlots(count, pageData.competitionType)
    const saved = Object.fromEntries(
      pageData.members.map((member, index) => [index + 1, {
        id: member.id, name: member.name, role: member.role, email: member.email,
        major: member.major, faculty: member.faculty, student_id: member.studentId,
        photo_file_id: member.photoFileId, sort_order: member.sortOrder,
      }]),
    )
    const valid = Object.fromEntries(slots.map((slot) => [slot.key, Boolean(saved[slot.key])]))
    setMembers(slots)
    setSavedData(saved)
    setValidState(valid)
  }, [pageData])

  const handleSave = (slot: MemberSlot) => (data: MemberFormValues) => {
    setSavedData((current) => ({ ...current, [slot.key]: data }))
    setValidState((current) => ({ ...current, [slot.key]: true }))
    toast.success(`${slot.label} berhasil disimpan`)
    const index = members.findIndex((member) => member.key === slot.key)
    if (index < members.length - 1) setActiveIndex(index + 1)
    else submitButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const allMembersValid = members.length > 0 && members.every((member) => validState[member.key] && savedData[member.key])

  const handleComplete = useCallback(async () => {
    if (!allMembersValid) {
      toast.error('Masih ada data anggota yang belum disimpan atau belum valid')
      return
    }

    try {
      const response = await finalizeMembers.mutateAsync({
        members: members.map((member, index) => ({
          ...savedData[member.key],
          role: index === 0 ? 'LEADER' : 'MEMBER',
          sort_order: index + 1,
        })),
      })
      toast.success(response.message)
      router.visit(response.data.redirectTo)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan biodata anggota')
    }
  }, [allMembersValid, finalizeMembers, members, savedData])

  const getLayoutTransform = (index: number) => {
    const offset = (index - activeIndex) * 110
    const scale = index === activeIndex ? 1.05 : 0.9
    const translateY = index === activeIndex ? -30 : 30
    return {
      transform: `translateX(${offset}%) translateY(${translateY}px) scale(${scale})`,
      zIndex: index === activeIndex ? 10 : 1,
      opacity: Math.abs(index - activeIndex) > 1 ? 0 : 1,
    }
  }

  if (membersQuery.isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Memuat biodata peserta...</div>
  }

  if (membersQuery.error || !pageData) {
    return <div className="py-12 text-center text-red-400">{membersQuery.error?.message ?? 'Data registrasi tidak tersedia.'}</div>
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 text-center text-primary-foreground">
      <div className="hidden md:flex items-center justify-center gap-4">
        <button
          onClick={() => setActiveIndex((activeIndex - 1 + members.length) % members.length)}
          disabled={members.length <= 1}
          className="relative z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border-2 border-border text-white hover:bg-card hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className={`relative flex justify-center items-center gap-6 ${pageData.competitionType === 'BUSINESS_IT_CASE'?'min-h-300':'min-h-225'} perspective-[1000px] w-full max-w-4xl`}>
          {members.map((member, index) => (
            <div
              key={member.key}
              className="absolute w-full max-w-lg transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform"
              style={getLayoutTransform(index)}
            >
              <div className="relative bg-background/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-2xl shadow-secondary/10">
                <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
                <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />
                <h3 className="text-xl font-semibold mb-4 relative z-10">{member.label}</h3>
                <FormMember
                  memberId={member.key}
                  role={member.role}
                  sortOrder={index}
                  participantCategory={pageData.participantCategory}
                  defaultValues={savedData[member.key]}
                  onFocus={() => setActiveIndex(index)}
                  onSave={handleSave(member)}
                  onValidationChange={(valid) => setValidState((current) => ({ ...current, [member.key]: valid }))}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setActiveIndex((activeIndex + 1) % members.length)}
          disabled={members.length <= 1}
          className="relative z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border-2 border-border text-white hover:bg-card hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="md:hidden space-y-6">
        {members.map((member, index) => (
          <div key={member.key} className="relative z-10 w-full rounded-xl border-0 bg-background/20 backdrop-blur-sm shadow-2xl">
            <span aria-hidden="true" className="auth-border-ribbon" />
            <span aria-hidden="true" className="auth-border-diamond" />
            <h3 className="text-lg font-semibold mb-4 relative z-10">{member.label}</h3>
            <FormMember
              memberId={member.key}
              role={member.role}
              sortOrder={index}
              participantCategory={pageData.participantCategory}
              defaultValues={savedData[member.key]}
              onSave={handleSave(member)}
              onValidationChange={(valid) => setValidState((current) => ({ ...current, [member.key]: valid }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-12 pb-8">
        <button
          ref={submitButtonRef}
          onClick={handleComplete}
          disabled={!allMembersValid || finalizeMembers.isPending}
          className="px-10 py-4 rounded-xl cursor-pointer bg-primary text-white font-bold text-lg hover:bg-primary/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl hover:scale-105"
        >
          {finalizeMembers.isPending ? (
            <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" />Menyimpan...</span>
          ) : 'Simpan Semua Peserta'}
        </button>
      </div>
    </div>
  )
}

Biodata.layout = (page: React.ReactNode) => (
  <RegistrationLayout title="Registrasi - Biodata" description="Lengkapi biodata peserta untuk melanjutkan proses pendaftaran.">
    {page}
  </RegistrationLayout>
)

export default Biodata
