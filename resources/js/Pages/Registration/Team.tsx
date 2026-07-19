import React from 'react'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'
import FormRegistrasiTeam from '../../features/registrations/components/FormRegistrasiTeam'

const Team = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center text-primary-foreground">
      <FormRegistrasiTeam competitionType='BUSINESS_IT_CASE' />
    </div>
  )
}

Team.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi - Team"
    description="Lengkapi data tim Anda untuk melanjutkan proses pendaftaran."
  >
    {page}
  </RegistrationLayout>
)

export default Team