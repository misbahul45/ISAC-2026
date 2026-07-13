import React from 'react'
import RegistrationLayout from './components/RegistrationLayout'

const Team = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center text-primary-foreground">
      <h2 className="text-4xl font-bold mb-4">Team</h2>
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