import React, { useState } from 'react'
import RegistrationLayout from './components/RegistrationLayout'
import FormRegistrasiTeam from './components/FormRegistrasiTeam'
import FormMember from './components/FormMember'

const Team = () => {
  const [hasRegistrasi, setHassRegistrasi]=useState(false)
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center text-primary-foreground">
      {hasRegistrasi?<FormMember /> :<FormRegistrasiTeam competitionType='BUSINESS_IT_CASE' />}
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