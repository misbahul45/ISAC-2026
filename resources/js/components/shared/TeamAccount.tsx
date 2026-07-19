import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import TeamDetail from '../ui/TeamDetail'
import MemberCard from './MemberCard'
import EditTeamForm from './EditTeamForm'
import EditMemberForm from './EditMemberForm'
import ApproveButton from './ApproveButton'
import type { TeamDetailInput, MemberDetailInput, TeamAccountData } from '@/schemas/teamAccount'

const STORAGE_KEY = 'team-account-data'

const defaultData: TeamAccountData = {
  team: {
    name: 'Lorem Ipsum',
    school_name: 'Lorem Ipsum',
    province: 'Lorem Ipsum',
    city: 'Lorem Ipsum',
    address: 'Lorem Ipsum',
    competition_type: 'BUSINESS_IT_CASE',
  },
  members: [
    { id: 1, namaLengkap: 'Lorem Ipsum', nomorTelepon: 'Lorem Ipsum', jenjangPendidikan: 'Lorem Ipsum' },
    { id: 2, namaLengkap: 'Lorem Ipsum', nomorTelepon: 'Lorem Ipsum', jenjangPendidikan: 'Lorem Ipsum' },
    { id: 3, namaLengkap: 'Lorem Ipsum', nomorTelepon: 'Lorem Ipsum', jenjangPendidikan: 'Lorem Ipsum' },
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
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 ">
      {editMode === 'team' ? (
        <div className="relative">
          <EditTeamForm
            defaultValues={data.team}
            onSave={handleSaveTeam}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <div className="bg-background/20 rounded-2xl backdrop-blur-sm p-6" >
          <TeamDetail data={data.team} onEdit={handleEditTeam} accent={accentColors[0]} />
        </div>
      )}

      {data.members.map((member, idx) => (
        <div key={member.id}>
          {editMode === 'member' && editingMemberId === member.id ? (
            <div className="bg-background/20 rounded-2xl backdrop-blur-sm p-6">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${accentColors[idx].glow} 0%, transparent 70%)`, transform: 'translate(40%, -40%)' }} />
              <EditMemberForm
                defaultValues={member}
                title={memberTitles[idx]}
                onSave={handleSaveMember}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <div className="bg-background/20 rounded-2xl backdrop-blur-sm p-6">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${accentColors[idx].glow} 0%, transparent 70%)`, transform: 'translate(40%, -40%)' }} />
              <MemberCard
                member={member}
                title={memberTitles[idx]}
                number={idx + 1}
                onEdit={() => handleEditMember(member.id)}
                accent={accentColors[idx]}
              />
            </div>
          )}
        </div>
      ))}

      <div className="relative overflow-hidden rounded-2xl p-6">
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
