import React from 'react'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'
import FormRegistrasiTeam from '../../features/registrations/components/FormRegistrasiTeam'
import { useRegistrationContext, useTeamProfile } from '@/features/registrations/hooks/useRegistration'

const Team = () => {
  const contextQuery = useRegistrationContext()
  const teamQuery = useTeamProfile()
  const context = contextQuery.data?.data
  const team = teamQuery.data?.data
  const competitionType = context?.registration?.competition.type ?? 'OLIMPIADE'
  const defaultValues = team ? {
    name: team.name ?? '',
    phone: team.phone ?? '',
    school_name: team.schoolName ?? '',
    school_province: team.schoolProvince ?? '',
    school_city: team.schoolCity ?? '',
    school_address: team.schoolAddress ?? '',
  } : undefined

  if (teamQuery.isLoading || contextQuery.isLoading) {
    return <div className="py-24 text-center text-muted-foreground">Memuat data tim...</div>
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center text-primary-foreground">
      {team?.verificationNote && <p className="mb-4 text-amber-400">Catatan revisi: {team.verificationNote}</p>}
      <FormRegistrasiTeam competitionType={competitionType} defaultValues={defaultValues} />
    </div>
  )
}

Team.layout = (page: React.ReactNode) => (
  <RegistrationLayout title="Registrasi - Team" description="Lengkapi data tim Anda untuk melanjutkan proses pendaftaran.">{page}</RegistrationLayout>
)

export default Team
