import React from 'react'
import type { CompetitionType } from '@/features/registrations/types/registrationTypes'

interface TeamDetailProps {
  data: {
    name: string
    phone: string
    schoolName: string
    province: string
    city: string
    address: string
    competitionType: CompetitionType
    batchName: string
  }
  onEdit?: () => void
  accent: {
    bg: string
    border: string
    glow: string
  }
}

const competitionLabels: Record<CompetitionType, string> = {
  OLIMPIADE: 'Olimpiade',
  BUSINESS_PLAN: 'Business Plan',
  BUSINESS_IT_CASE: 'Business IT Case',
}

const competitionBadgeStyles: Record<CompetitionType, string> = {
  OLIMPIADE: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  BUSINESS_PLAN: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  BUSINESS_IT_CASE: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
}

const TeamDetail: React.FC<TeamDetailProps> = ({ data, onEdit, accent }) => {
  const fields = [
    { label: 'Nama Tim', value: data.name },
    { label: 'Nomor Telepon', value: data.phone },
    { label: 'Sekolah', value: data.schoolName },
    { label: 'Provinsi', value: data.province },
    { label: 'Kota', value: data.city },
    { label: 'Alamat', value: data.address },
    { label: 'Batch', value: data.batchName },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Detail Tim</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${competitionBadgeStyles[data.competitionType]}`}>
            {competitionLabels[data.competitionType]}
          </span>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/10 hover:bg-white/10 transition-all"
            style={{ background: accent.bg }}
          >
            Edit Tim
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.label} className={`space-y-1 ${field.label === 'Alamat' ? 'sm:col-span-2' : ''}`}>
            <p className="text-xs text-white/40 uppercase tracking-wider">{field.label}</p>
            <p className="text-white font-medium">{field.value}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default TeamDetail
