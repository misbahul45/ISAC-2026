import { zodResolver } from '@hookform/resolvers/zod'
import { FileCheck, Image, Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { documentSchema, type DocumentFormData } from '@/features/registrations/schemas/uploadDocument'

interface FormDocumentsProps {
  defaultValues?: DocumentFormData
  onSave: (data: DocumentFormData) => Promise<void>
  isSubmitting?: boolean
}

const inputClassName = 'w-full py-5 pl-12 sm:py-6 sm:pl-14 md:py-7 md:pl-16 lg:py-8'
const iconClassName = 'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground sm:left-5 sm:h-5 sm:w-5'

const FormDocuments = ({ defaultValues, onSave, isSubmitting = false }: FormDocumentsProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const form = useForm<DocumentFormData>({
    mode: 'onChange',
    resolver: zodResolver(documentSchema),
    defaultValues: defaultValues ?? { document_url: '', twibbon_url: '' },
  })

  useEffect(() => {
    if (defaultValues) form.reset(defaultValues)
  }, [defaultValues, form])

  useGSAP(() => {
    if (!formRef.current) return
    gsap.from(formRef.current.querySelectorAll('.gsap-field'), {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
    })
    gsap.from(formRef.current.querySelector('.gsap-button'), {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.4,
      ease: 'power3.out',
    })
  }, { scope: formRef })

  return (
    <form ref={formRef} id="documents-form" onSubmit={form.handleSubmit(onSave)} className="relative z-10 space-y-6">
      <FieldGroup className="gap-6 sm:gap-8">
        <Controller
          name="document_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gsap-field">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                <FieldLabel className="text-lg font-medium">Dokumen Kelengkapan Pendaftaran</FieldLabel>
                <span className="text-xs text-muted-foreground bg-card/60 px-3 py-1 rounded-full border border-border/30">
                  Link Google Drive berisi seluruh dokumen kelengkapan tim
                </span>
              </div>
              <div className="relative">
                <FileCheck className={iconClassName} />
                <Input {...field} type="url" placeholder="https://drive.google.com/..." autoComplete="off" aria-invalid={fieldState.invalid} className={inputClassName} />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="twibbon_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gsap-field">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                <FieldLabel className="text-lg font-medium">Twibbon Peserta</FieldLabel>
                <span className="text-xs text-muted-foreground bg-card/60 px-3 py-1 rounded-full border border-border/30">
                  Link Google Drive berisi twibbon seluruh peserta
                </span>
              </div>
              <div className="relative">
                <Image className={iconClassName} />
                <Input {...field} type="url" placeholder="https://drive.google.com/..." autoComplete="off" aria-invalid={fieldState.invalid} className={inputClassName} />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-center mt-8 gsap-button">
        <Button
          type="submit"
          form="documents-form"
          className="w-full py-4 bg-primary text-white hover:bg-primary/80 text-lg font-semibold rounded-xl transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={!form.formState.isValid || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3"><Loader2 className="w-6 h-6 animate-spin" />Menyimpan...</span>
          ) : 'Simpan Dokumen'}
        </Button>
      </div>
    </form>
  )
}

export default FormDocuments
