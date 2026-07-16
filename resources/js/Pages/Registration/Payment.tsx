import React from 'react'
import RegistrationLayout from './components/RegistrationLayout'
import FormPayment from './components/FormPayment'

const Payment = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center text-primary-foreground">
      <FormPayment />
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