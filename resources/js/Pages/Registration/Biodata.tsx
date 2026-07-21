import React, { useCallback, useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import RegistrationLayout from '@/features/registrations/components/RegistrationLayout'
import FormMember from '@/features/registrations/components/FormMember'
import { useFinalizeMembers, useMembers } from '@/features/registrations/hooks/useRegistration'
import type { MemberFormValues, MemberRole } from '@/features/registrations/types/registrationTypes'

interface MemberSlot {
  key: number
  role: MemberRole
  label: string
}

const createSlots = (count: number): MemberSlot[] =>
  Array.from({ length: count }, (_, index) => ({
    key: index + 1,
    role: index === 0 ? 'LEADER' : 'MEMBER',
    label: index === 0 ? 'Ketua Tim' : `Anggota ${index}`,
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
    const count = Math.max(pageData.minMembers, pageData.members.length)
    const slots = createSlots(count)
    const saved = Object.fromEntries(
      pageData.members.map((member, index) => [index + 1, member]),
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

  const addMember = () => {
    if (!pageData || members.length >= pageData.maxMembers) return
    setMembers(createSlots(members.length + 1))
    setActiveIndex(members.length)
  }

  const removeMember = () => {
    if (!pageData || members.length <= pageData.minMembers) return
    const last = members[members.length - 1]
    setMembers(createSlots(members.length - 1))
    setSavedData((current) => {
      const next = { ...current }
      delete next[last.key]
      return next
    })
    setValidState((current) => {
      const next = { ...current }
      delete next[last.key]
      return next
    })
    setActiveIndex((current) => Math.min(current, members.length - 2))
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
          sort_order: index,
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
    return <div className="py-24 text-center text-muted-foreground">Memuat biodata peserta...</div>
  }

  if (membersQuery.error || !pageData) {
    return <div className="py-24 text-center text-red-400">{membersQuery.error?.message ?? 'Data registrasi tidak tersedia.'}</div>
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 text-center text-primary-foreground">
      <div className="mb-6 flex items-center justify-center gap-3">
        {pageData.competitionType !== 'OLIMPIADE' && (
          <>
            <button
              type="button"
              onClick={addMember}
              disabled={members.length >= pageData.maxMembers}
              className="flex items-center gap-2 rounded-lg border border-border bg-card/80 px-4 py-2 text-sm disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Tambah Anggota
            </button>
            <button
              type="button"
              onClick={removeMember}
              disabled={members.length <= pageData.minMembers}
              className="flex items-center gap-2 rounded-lg border border-border bg-card/80 px-4 py-2 text-sm disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" /> Hapus Anggota
            </button>
          </>
        )}
        <span className="text-sm text-muted-foreground">{members.length} dari maksimal {pageData.maxMembers} peserta</span>
      </div>

      <div className="hidden md:flex items-center justify-center gap-4">
        <button
          onClick={() => setActiveIndex((activeIndex - 1 + members.length) % members.length)}
          disabled={members.length <= 1}
          className="relative z-50 p-3 rounded-full bg-card/80 backdrop-blur-md border-2 border-border text-white hover:bg-card hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="relative flex justify-center items-center gap-6 min-h-[1100px] perspective-[1000px] w-full max-w-4xl">
          {members.map((member, index) => (
            <div
              key={member.key}
              className="absolute w-full max-w-lg transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform"
              style={getLayoutTransform(index)}
            >
              <div className="relative bg-background/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-2xl shadow-secondary/30">
                <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
                <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />
                <h3 className="text-xl font-semibold mb-4 relative z-10">{member.label}</h3>
                <FormMember
                  memberId={member.key}
                  role={member.role}
                  sortOrder={index}
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
          <div key={member.key} className="relative bg-background/80 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-lg shadow-secondary/20">
            <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
            <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />
            <h3 className="text-lg font-semibold mb-4 relative z-10">{member.label}</h3>
            <FormMember
              memberId={member.key}
              role={member.role}
              sortOrder={index}
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
          ) : 'Simpan Semua Anggota ke Tim'}
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
