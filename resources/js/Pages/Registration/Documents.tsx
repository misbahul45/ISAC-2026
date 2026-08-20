import React, { useCallback, useRef } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import RegistrationLayout from '@/features/registrations/components/RegistrationLayout'
import FormDocuments from '@/features/registrations/components/FormDocuments'
import type { DocumentFormData } from '@/features/registrations/schemas/uploadDocument'
import { useDocuments, useUpdateDocuments } from '@/features/registrations/hooks/useRegistration'

const Documents = () => {
  const documentsQuery = useDocuments()
  const updateDocuments = useUpdateDocuments()
  const cardRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!cardRef.current) return
    gsap.from(cardRef.current, {
      y: 60,
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: 'power3.out',
    })
    gsap.from(cardRef.current.querySelector('.gsap-header'), {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.2,
      ease: 'power3.out',
    })
  }, { scope: cardRef })

  const handleSave = useCallback(async (data: DocumentFormData) => {
    try {
      const response = await updateDocuments.mutateAsync(data)
      toast.success(response.message)
      router.visit(response.data.redirectTo, { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan dokumen')
    }
  }, [updateDocuments])

  if (documentsQuery.isLoading) {
    return <div className="py-24 text-center text-muted-foreground">Memuat dokumen registrasi...</div>
  }

  if (documentsQuery.error || !documentsQuery.data) {
    return <div className="py-24 text-center text-red-400">{documentsQuery.error?.message ?? 'Data dokumen tidak tersedia.'}</div>
  }

  const data = documentsQuery.data.data

  return (
    <div className="w-full max-w-7xl mx-auto text-center text-primary-foreground">
      <div className="flex justify-center items-center min-h-[600px] perspective-[1000px]">
        <div className="w-full max-w-6xl">
          <div ref={cardRef} className="relative bg-background/80 backdrop-blur-md rounded-2xl p-8 border border-border/50">
            <span aria-hidden="true" className="header-border-track absolute inset-0 rounded-2xl pointer-events-none" />
            <span aria-hidden="true" className="header-border-spin absolute inset-0 rounded-2xl pointer-events-none" />
            <div className="mb-8 relative z-10 gsap-header">
              <p className="text-muted-foreground text-sm">
                Pastikan kedua folder Google Drive dapat dibuka oleh panitia melalui tautan yang diberikan.
              </p>
              {data.revisionNote && <p className="mt-3 text-sm text-amber-400">Catatan revisi: {data.revisionNote}</p>}
            </div>
            <FormDocuments
              defaultValues={{ document_url: data.documentUrl ?? '', twibbon_url: data.twibbonUrl ?? '' }}
              onSave={handleSave}
              isSubmitting={updateDocuments.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

Documents.layout = (page: React.ReactNode) => (
  <RegistrationLayout title="Registrasi - Documents" description="Masukkan tautan dokumen yang diperlukan untuk melanjutkan proses pendaftaran.">
    {page}
  </RegistrationLayout>
)

export default Documents
