import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import TeamDetail from './TeamDetail'
import MemberCard from './MemberCard'
import EditTeamForm from './EditTeamForm'
import EditMemberForm from './EditMemberForm'
import ApproveButton from './ApproveButton'
import type { TeamDetailInput, MemberDetailInput, TeamAccountData } from '@/schemas/teamAccount'

const STORAGE_KEY = 'team-account-data'

const defaultData: TeamAccountData = {
  team: {
    name: 'TechVision UNAIR',
    school_name: 'Universitas Airlangga',
    province: 'Jawa Timur',
    city: 'Surabaya',
    address: 'Jl. Mulyorejo, Kecamatan Mulyorejo, Kota Surabaya, Jawa Timur 60115',
    competition_type: 'BUSINESS_IT_CASE',
  },
  members: [
    {
      id: 1,
      namaLengkap: 'Muhammad Fajar Pratama',
      nomorTelepon: '081234567890',
      jenjangPendidikan: 'S1',
    },
    {
      id: 2,
      namaLengkap: 'Nabila Putri Ramadhani',
      nomorTelepon: '081298765432',
      jenjangPendidikan: 'S1',
    },
    {
      id: 3,
      namaLengkap: 'Rizky Aditya Saputra',
      nomorTelepon: '082112345678',
      jenjangPendidikan: 'S1',
    },
  ],
  approvedAt: null,
}

const TeamAccount = () => {
  const [data, setData] = useState<TeamAccountData>(() => {
    if (typeof window === 'undefined') return defaultData
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : defaultData
  })

  const [editMode, setEditMode] = useState<'team' | 'member' | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const handleSaveTeam = useCallback((teamData: TeamDetailInput) => {
    setData(prev => ({ ...prev, team: teamData, approvedAt: null }))
    setEditMode(null)
    setHasChanges(true)
    toast.success('Data tim berhasil diperbarui')
  }, [])

  const handleSaveMember = useCallback((memberData: MemberDetailInput) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberData.id ? memberData : m),
      approvedAt: null,
    }))
    setEditMode(null)
    setEditingMemberId(null)
    setHasChanges(true)
    toast.success('Data anggota berhasil diperbarui')
  }, [])

  const handleApprove = useCallback(() => {
    const now = new Date().toISOString()
    setData(prev => ({ ...prev, approvedAt: now }))
    setHasChanges(false)
    toast.success('Semua data telah disetujui!', {
      description: 'Anda dapat melanjutkan ke pembayaran.',
    })
  }, [])

  const handleEditTeam = useCallback(() => {
    setEditMode('team')
  }, [])

  const handleEditMember = useCallback((memberId: number) => {
    setEditingMemberId(memberId)
    setEditMode('member')
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditMode(null)
    setEditingMemberId(null)
  }, [])

  const memberTitles = ['Ketua Tim', 'Anggota 1', 'Anggota 2']
  const accentColors = [
    { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', glow: 'rgba(139, 92, 246, 0.4)' },
    { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.4)' },
    { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', glow: 'rgba(16, 185, 129, 0.4)' },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4 ">
      {editMode === 'team' ? (
        <div className="relative">
          <EditTeamForm
            defaultValues={data.team}
            onSave={handleSaveTeam}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <div className="relative isolate overflow-hidden rounded-2xl">
          {/* Border gradient — sama seperti Header: track statis + spin conic-gradient */}
          <span aria-hidden="true" className="header-border-track" />
          <span aria-hidden="true" className="header-border-spin" />

          <div className="relative z-10 rounded-[inherit] bg-background/20 backdrop-blur-sm p-6">
            <TeamDetail data={data.team} onEdit={handleEditTeam} accent={accentColors[0]} />
          </div>
        </div>
      )}

      {data.members.map((member, idx) => (
        <div key={member.id} className="relative isolate overflow-hidden rounded-2xl">
          {/* Border gradient — sama seperti Header: track statis + spin conic-gradient */}
          <span aria-hidden="true" className="header-border-track" />
          <span aria-hidden="true" className="header-border-spin" />

          <div className="relative z-10 rounded-[inherit] bg-background/20 backdrop-blur-sm p-6">
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${accentColors[idx].glow} 0%, transparent 70%)`,
                transform: 'translate(40%, -40%)',
              }}
            />

            {editMode === 'member' && editingMemberId === member.id ? (
              <EditMemberForm
                defaultValues={member}
                title={memberTitles[idx]}
                onSave={handleSaveMember}
                onCancel={handleCancelEdit}
              />
            ) : (
              <MemberCard
                member={member}
                title={memberTitles[idx]}
                number={idx + 1}
                onEdit={() => handleEditMember(member.id)}
                accent={accentColors[idx]}
              />
            )}
          </div>
        </div>
      ))}

      <div className="relative z-10 rounded-[inherit] p-6">
        <ApproveButton
          isApproved={!!data.approvedAt}
          hasChanges={hasChanges}
          onApprove={handleApprove}
        />
      </div>
    </div>
  )
}

export default TeamAccount