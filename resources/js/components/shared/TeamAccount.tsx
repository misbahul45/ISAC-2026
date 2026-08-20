import TeamDetail from './TeamDetail'
import { ExternalLink, FileText, Image } from 'lucide-react'
import MemberCard from './MemberCard'
import { useRegistrationSummary } from '@/features/registrations/hooks/useRegistration'
import { formatCurrency } from '@/lib/formatters'

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
            name: summary.team.name ?? '-', phone: summary.team.phone ?? '-', institutionName: summary.team.institutionName ?? '-',
            competitionType: registration?.competition.type ?? 'OLIMPIADE', batchName: registration?.batch.name ?? '-',
          }} accent={accentColors[0]} />
        </div>
      </div>

      {registration && (
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-card/45 p-5 backdrop-blur-md sm:grid-cols-3">
          <div><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Competition</p><p className="mt-2 font-semibold text-foreground">{registration.competition.name}</p></div>
          <div><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Batch terpilih</p><p className="mt-2 font-semibold text-foreground">{registration.batch.name} · {formatCurrency(registration.batch.price)}</p></div>
          <div><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Waktu pembayaran</p><p className="mt-2 font-semibold text-foreground">{registration.competition.paymentFlow === 'UPFRONT' ? 'Saat pendaftaran' : 'Jika lolos Semifinal'}</p></div>
        </div>
      )}

      {summary.members.map((member, index) => (
        <div key={member.id} className="relative isolate overflow-hidden rounded-2xl">
          <span aria-hidden="true" className="header-border-track" /><span aria-hidden="true" className="header-border-spin" />
          <div className="relative z-10 rounded-[inherit] bg-background/20 backdrop-blur-sm p-6">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 pointer-events-none" style={{ background: `radial-gradient(circle, ${accentColors[index % accentColors.length].glow} 0%, transparent 70%)`, transform: 'translate(40%, -40%)' }} />
            <MemberCard
              member={{
                id: member.id, name: member.name, role: member.role, email: member.email,
                major: member.major, faculty: member.faculty, student_id: member.studentId,
                photo_file_id: member.photoFileId, sort_order: member.sortOrder,
              }}
              participantCategory={registration?.competition.type === 'BUSINESS_IT_CASE' ? 'UNIVERSITY_STUDENT' : 'HIGH_SCHOOL_STUDENT'}
              title={registration?.competition.type === 'OLIMPIADE'
                ? 'Peserta Olimpiade'
                : member.role === 'LEADER'
                  ? 'Ketua Tim'
                  : `Anggota ${index}`}
              number={index + 1}
              accent={accentColors[index % accentColors.length]}
            />
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {[
          {
            href: summary.team.documentUrl,
            Icon: FileText,
            title: 'Dokumen Kelengkapan',
            description: 'Buka folder atau berkas dokumen yang dikirimkan Team.',
            iconClassName: 'bg-primary/15 text-primary',
          },
          {
            href: summary.team.twibbonUrl,
            Icon: Image,
            title: 'Twibbon Peserta',
            description: 'Buka tautan unggahan Twibbon Team.',
            iconClassName: 'bg-secondary/15 text-secondary',
          },
        ].map(({ href, Icon, title, description, iconClassName }) => {
          const content = <>
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="size-5" /></span>
            <span className="min-w-0 flex-1 text-left"><span className="block font-semibold text-foreground">{title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span></span>
            <ExternalLink className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </>

          return href
            ? <a key={title} href={href} target="_blank" rel="noreferrer" className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white/10">{content}</a>
            : <div key={title} aria-disabled="true" className="flex cursor-not-allowed items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 opacity-60"><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="size-5" /></span><span className="min-w-0 flex-1 text-left"><span className="block font-semibold text-foreground">{title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Tautan belum ditambahkan.</span></span></div>
        })}
      </div>
    </div>
  )
}

export default TeamAccount
