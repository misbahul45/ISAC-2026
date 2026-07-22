import React from 'react'
import type { MemberFormValues, ParticipantCategory } from '@/features/registrations/types/registrationTypes'

interface MemberCardProps {
  member: MemberFormValues
  participantCategory: ParticipantCategory
  title: string
  number: number
  onEdit?: () => void
  accent: {
    bg: string
    border: string
    glow: string
  }
}

const MemberCard: React.FC<MemberCardProps> = ({ member, participantCategory, title, number, onEdit, accent }) => {
  const isUniversity = participantCategory === 'UNIVERSITY_STUDENT'
  const fields = [
    { label: 'Nama Lengkap', value: member.name },
    { label: 'Email', value: member.email },
    ...(isUniversity
      ? [
          { label: 'Jurusan', value: member.major || '-' },
          { label: 'Fakultas', value: member.faculty || '-' },
        ]
      : []),
    { label: isUniversity ? 'NIM' : 'NISN', value: member.student_id },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
          >
            {number}
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white border border-white/10 hover:bg-white/10 transition-all"
            style={{ background: accent.bg }}
          >
            Edit
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <p className="text-xs text-white/40 uppercase tracking-wider">{field.label}</p>
            <p className="text-white font-medium">{field.value}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default MemberCard
