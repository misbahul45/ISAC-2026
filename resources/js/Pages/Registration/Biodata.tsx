import React from 'react'
import RegistrationLayout from './components/RegistrationLayout'

const Biodata = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center text-primary-foreground">
      <h2 className="text-4xl font-bold mb-4">Biodata</h2>
    </div>
  )
}

Biodata.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi - Biodata"
    description="Lengkapi biodata peserta untuk melanjutkan proses pendaftaran."
  >
    {page}
  </RegistrationLayout>
)

export default Biodata