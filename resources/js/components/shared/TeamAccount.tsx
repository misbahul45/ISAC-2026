import TeamDetail from './TeamDetail'
import MemberCard from './MemberCard'
import { useRegistrationSummary } from '@/features/registrations/hooks/useRegistration'

const accentColors = [
  { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', glow: 'rgba(139, 92, 246, 0.4)' },
  { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.4)' },
  { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', glow: 'rgba(16, 185, 129, 0.4)' },
]

const TeamAccount = () => {
  const summaryQuery = useRegistrationSummary()
  if (summaryQuery.isLoading) return <div className="w-full max-w-6xl mx-auto space-y-6 p-4 text-center text-[#8891BB]">Memuat data tim...</div>
  if (summaryQuery.error || !summaryQuery.data) return <div className="w-full max-w-6xl mx-auto space-y-6 p-4 text-center text-red-400">{summaryQuery.error?.message ?? 'Data tim tidak tersedia.'}</div>

  const summary = summaryQuery.data.data
  const registration = summary.registration

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4 ">
      <div className="relative isolate overflow-hidden rounded-2xl">
        <span aria-hidden="true" className="header-border-track" /><span aria-hidden="true" className="header-border-spin" />
        <div className="relative z-10 rounded-[inherit] bg-background/20 backdrop-blur-sm p-6">
          <TeamDetail data={{
            name: summary.team.name ?? '-', phone: summary.team.phone ?? '-', schoolName: summary.team.schoolName ?? '-',
            province: summary.team.schoolProvince ?? '-', city: summary.team.schoolCity ?? '-', address: summary.team.schoolAddress ?? '-',
            competitionType: registration?.competition.type ?? 'OLIMPIADE', batchName: registration?.batch.name ?? '-',
          }} accent={accentColors[0]} />
        </div>
      </div>

      {summary.members.map((member, index) => (
        <div key={member.id} className="relative isolate overflow-hidden rounded-2xl">
          <span aria-hidden="true" className="header-border-track" /><span aria-hidden="true" className="header-border-spin" />
          <div className="relative z-10 rounded-[inherit] bg-background/20 backdrop-blur-sm p-6">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColors[index % accentColors.length].glow} 0%, transparent 70%)`, transform: 'translate(40%, -40%)' }} />
            <MemberCard
              member={{
                id: member.id, name: member.name, role: member.role, email: member.email, phone: member.phone,
                education_level: member.educationLevel, major: member.major, faculty: member.faculty,
                student_id: member.studentId, birth_date: member.birthDate.slice(0, 10),
                photo_file_id: member.photoFileId, sort_order: member.sortOrder,
              }}
              title={member.role === 'LEADER' ? 'Ketua Tim' : `Anggota ${index}`}
              number={index + 1}
              accent={accentColors[index % accentColors.length]}
            />
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <a href={summary.team.documentUrl ?? '#'} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-all hover:bg-white/10">Dokumen Kelengkapan</a>
        <a href={summary.team.twibbonUrl ?? '#'} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-all hover:bg-white/10">Twibbon Peserta</a>
      </div>
    </div>
  )
}

export default TeamAccount
