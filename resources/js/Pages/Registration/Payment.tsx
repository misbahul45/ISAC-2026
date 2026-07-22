import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import RegistrationLayout from '@/features/registrations/components/RegistrationLayout'
import FormPayment from '@/features/registrations/components/FormPayment'
import TeamAccount from '@/components/shared/TeamAccount'
import { usePayment, useSubmitPayment } from '@/features/registrations/hooks/useRegistration'
import type { PaymentFormValues } from '@/features/registrations/types/registrationTypes'

const Payment = () => {
  const [step, setStep] = useState<'account' | 'payment'>('account')
  const paymentQuery = usePayment()
  const submitPayment = useSubmitPayment()

  const handleSubmit = async (values: PaymentFormValues) => {
    try {
      const response = await submitPayment.mutateAsync(values)
      toast.success(response.message)
      router.visit(response.data.redirectTo)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim pembayaran')
    }
  }

  if (paymentQuery.isLoading) {
    return <div className="py-24 text-center text-muted-foreground">Memuat informasi pembayaran...</div>
  }

  if (paymentQuery.error || !paymentQuery.data) {
    return <div className="py-24 text-center text-red-400">{paymentQuery.error?.message ?? 'Informasi pembayaran tidak tersedia.'}</div>
  }

  const payment = paymentQuery.data.data

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 text-primary-foreground">
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${step === 'account' ? 'bg-[#8B5CFF]/20 text-[#8B5CFF]' : 'bg-[#9DFF4A]/20 text-[#9DFF4A]'}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>Verifikasi Data</span>
        </div>
        <div className="w-8 h-px bg-[rgba(254,254,254,0.15)]" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${step === 'payment' ? 'bg-[#8B5CFF]/20 text-[#8B5CFF]' : 'text-[#8891BB]'}`}>
          <span>Pembayaran</span>
        </div>
      </div>

      {step === 'account' && (
        <div className="space-y-8 w-full">
          <TeamAccount />
          <div className="flex justify-center">
            <button onClick={() => setStep('payment')} className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#8B5CFF] to-[#5B3FBF] text-white hover:shadow-[0_0_24px_-4px_rgba(139,92,255,0.5)] hover:scale-[1.02] transition-all duration-300 font-semibold">
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="space-y-8">
          {payment.rejectionReason && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400">Alasan penolakan: {payment.rejectionReason}</p>}
          <FormPayment
            originalAmount={Number(payment.originalAmount)}
            amount={Number(payment.amount)}
            discountPercent={Number(payment.discountPercent)}
            discountAmount={Number(payment.discountAmount)}
            promoApplied={payment.promoApplied}
            promoCode={payment.promoCode}
            qrImageUrl={payment.qrImageUrl}
            paymentMethods={payment.paymentMethods}
            instructions={payment.paymentInstructions}
            existingProof={payment.existingProof}
            isSubmitting={submitPayment.isPending}
            onSubmit={handleSubmit}
          />
          <div className="flex justify-center">
            <button onClick={() => setStep('account')} className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#171B3B]/80 border border-[rgba(254,254,254,0.1)] text-[#8891BB] hover:text-white hover:border-[rgba(254,254,254,0.2)] transition-all duration-300 font-semibold">
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali ke Data Tim</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

Payment.layout = (page: React.ReactNode) => (
  <RegistrationLayout title="Registrasi - Payment" description="Selesaikan pembayaran untuk menyelesaikan proses pendaftaran.">
    {page}
  </RegistrationLayout>
)

export default Payment
