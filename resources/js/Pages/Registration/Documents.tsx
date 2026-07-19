import React, { useState, useCallback, useRef } from 'react'
import RegistrationLayout from '../../features/registrations/components/RegistrationLayout'
import FormDocuments from '../../features/registrations/components/FormDocuments'
import { DocumentFormData } from '../../features/registrations/schemas/uploadDocument'
import { toast } from 'sonner'
import { Loader2, FileText } from 'lucide-react'
import { router } from '@inertiajs/react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const Documents = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allCompleted, setAllCompleted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!cardRef.current) return

    gsap.from(cardRef.current, {
      y: 60,
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: 'power3.out',
    })

    const header = cardRef.current.querySelector('.gsap-header')
    if (header) {
      gsap.from(header, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out',
      })
    }
  }, { scope: cardRef })

  useGSAP(() => {
    if (!successRef.current || !allCompleted) return

    gsap.from(successRef.current.children, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'back.out(1.7)',
    })
  }, { scope: successRef, dependencies: [allCompleted] })

  const handleSave = useCallback((data: DocumentFormData) => {
    setIsSubmitting(true)
    toast.loading('Menyimpan dokumen ke database...')

    setTimeout(() => {
      localStorage.removeItem('documents-form-data')
      setAllCompleted(true)
      setIsSubmitting(false)
      toast.dismiss()
      toast.success('Semua dokumen berhasil disimpan ke database!')

      setTimeout(() => {
        router.visit('/registration/payment')
      }, 1500)
    }, 2500)
  }, [])

  return (
    <div className="w-full max-w-7xl mx-auto text-center text-primary-foreground">
      <div className="flex justify-center items-center min-h-[600px] perspective-[1000px]">
        <div className="w-full max-w-6xl">
          <div
            ref={cardRef}
            className="relative bg-background/80 backdrop-blur-md rounded-2xl p-8 border border-border/50"
          >
            <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
            <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />

            <div className="mb-8 relative z-10 gsap-header">
              <p className="text-muted-foreground text-sm">
                Upload dokumen persyaratan setiap anggota.{' '}
                <span className="text-primary font-medium">Maksimal ukuran setiap file : 10 MB</span>
              </p>
            </div>

            {!allCompleted ? (
              <FormDocuments onSave={handleSave} />
            ) : (
              <div ref={successRef} className="flex flex-col items-center gap-4 py-12">
                <div className="p-4 rounded-full bg-green-500/20 border border-green-500/50">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-400 font-medium text-lg">Dokumen berhasil disimpan!</p>
                <p className="text-muted-foreground text-sm">Mengalihkan ke halaman pembayaran...</p>
                <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
              </div>
            )}
          </div>
        </div>
      </div>
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