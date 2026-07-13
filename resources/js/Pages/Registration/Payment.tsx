import React from 'react'
import RegistrationLayout from './components/RegistrationLayout'

const Payment = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center text-primary-foreground">
      <h2 className="text-4xl font-bold mb-4">Payment</h2>
    </div>
  )
}

Payment.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi - Payment"
    description="Selesaikan pembayaran untuk menyelesaikan proses pendaftaran."
  >
    {page}
  </RegistrationLayout>
)

export default Payment