import React from 'react'
import { router } from '@inertiajs/react'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'
import TeamAccount from '@/components/shared/TeamAccount'
import { useSubmitRegistrationVerification } from '@/features/registrations/hooks/useRegistration'

const Validation = () => {
  const submitMutation = useSubmitRegistrationVerification()

  const handleSubmit = async () => {
    try {
      const response = await submitMutation.mutateAsync()
      toast.success(response.message)
      router.visit(response.data.redirectTo)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal mengirim data untuk verifikasi.',
      )
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 text-primary-foreground">
      <TeamAccount />
      <div className="relative z-10 rounded-[inherit] p-6">
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-[#9DFF4A] to-[#7AD936] text-[#0F1329] hover:shadow-[0_0_24px_-4px_rgba(157,255,74,0.4)] hover:scale-[1.01] transition-all duration-300 font-semibold group disabled:opacity-50"
        >
          <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span>
            {submitMutation.isPending
              ? 'Mengirim...'
              : 'Kirim Data untuk Verifikasi'}
          </span>
        </button>
      </div>
    </div>
  )
}

Validation.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi - Validation"
    description="Periksa kembali seluruh data tim sebelum dikirim untuk verifikasi."
  >
    {page}
  </RegistrationLayout>
)

export default Validation
