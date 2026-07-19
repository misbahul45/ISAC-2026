import React from 'react'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'

const Documents = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center text-primary-foreground">
      <h2 className="text-4xl font-bold mb-4">Documents</h2>
    </div>
  )
}

Documents.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi - Documents"
    description="Unggah dokumen yang diperlukan untuk melanjutkan proses pendaftaran."
  >
    {page}
  </RegistrationLayout>
)

export default Documents