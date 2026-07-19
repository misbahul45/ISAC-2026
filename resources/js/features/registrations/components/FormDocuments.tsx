import { zodResolver } from '@hookform/resolvers/zod'
import { FileCheck, Image, Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { documentSchema, type DocumentFormData } from '@/features/registrations/schemas/uploadDocument'
import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface FormDocumentsProps {
  onSave?: (data: DocumentFormData) => void
  onValidationChange?: (isValid: boolean) => void
}

const inputClassName = 'w-full py-5 pl-12 sm:py-6 sm:pl-14 md:py-7 md:pl-16 lg:py-8'
const iconClassName = 'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground sm:left-5 sm:h-5 sm:w-5'

const FormDocuments = ({ onSave, onValidationChange }: FormDocumentsProps) => {
  const storageKey = 'documents-form-data'
  const [hasSaved, setHasSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useGSAP(() => {
    if (!formRef.current) return
    const fields = formRef.current.querySelectorAll('.gsap-field')
    const button = formRef.current.querySelector('.gsap-button')

    gsap.from(fields, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
    })

    gsap.from(button, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.4,
      ease: 'power3.out',
    })
  }, { scope: formRef })

  const getSavedData = (): Partial<DocumentFormData> => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  const form = useForm<DocumentFormData>({
    mode: 'onChange',
    resolver: zodResolver(documentSchema),
    defaultValues: {
      kelengkapanPendaftaran: '',
      twibbonPeserta: '',
      ...getSavedData(),
    },
  })

  const { isValid } = form.formState
  const watchedValues = form.watch()
  const [lastSavedValues, setLastSavedValues] = useState<DocumentFormData | null>(null)

  useEffect(() => {
    if (onValidationChange) onValidationChange(isValid)
  }, [isValid, onValidationChange])

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [form, storageKey])

  useEffect(() => {
    if (lastSavedValues) {
      const isChanged = JSON.stringify(watchedValues) !== JSON.stringify(lastSavedValues)
      if (isChanged) setHasSaved(false)
    }
  }, [watchedValues, lastSavedValues])

  const onSubmit = (data: DocumentFormData) => {
    setIsSubmitting(true)
    localStorage.setItem(storageKey, JSON.stringify(data))
    setLastSavedValues(data)
    setHasSaved(true)
    if (onSave) onSave(data)
  }

  return (
    <form
      ref={formRef}
      id="documents-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="relative z-10 space-y-6"
    >
      <FieldGroup className="gap-6 sm:gap-8">
        <Controller
          name="kelengkapanPendaftaran"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gsap-field">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                <FieldLabel className="text-lg font-medium">Dokumen Kelengkapan Pendaftaran</FieldLabel>
                <span className="text-xs text-muted-foreground bg-card/60 px-3 py-1 rounded-full border border-border/30">
                  Link Google Drive berisi semua dokumen kelengkapan pendaftaran tim
                </span>
              </div>

              <div className="relative">
                <FileCheck className={iconClassName} />

                <Input
                  {...field}
                  type="url"
                  placeholder="Masukkan link Google Drive kelengkapan pendaftaran"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                  className={inputClassName}
                />
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="twibbonPeserta"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gsap-field">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                <FieldLabel className="text-lg font-medium">Dokumen Twibbon Peserta</FieldLabel>
                <span className="text-xs text-muted-foreground bg-card/60 px-3 py-1 rounded-full border border-border/30">
                  Link Google Drive berisi foto twibbon seluruh anggota tim
                </span>
              </div>

              <div className="relative">
                <Image className={iconClassName} />

                <Input
                  {...field}
                  type="url"
                  placeholder="Masukkan link Google Drive twibbon peserta"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                  className={inputClassName}
                />
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-center mt-8 gsap-button">
        <Button
          type="submit"
          form="documents-form"
          className="w-full py-4 bg-primary text-white hover:bg-primary/80 text-lg font-semibold rounded-xl transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={!isValid || isSubmitting || hasSaved}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Menyimpan...
            </span>
          ) : hasSaved ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Tersimpan
            </span>
          ) : (
            'Simpan Dokumen'
          )}
        </Button>
      </div>
    </form>
  )
}

export default FormDocuments