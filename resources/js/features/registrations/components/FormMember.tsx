import { zodResolver } from '@hookform/resolvers/zod'
import { User, Phone, GraduationCap } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { memberSchema, type MemberFormData } from '@/features/registrations/schemas/createTeamMember'
import React, { useEffect, useState } from 'react'

interface FormMemberProps {
  memberId: number
  onFocus?: () => void
  onSave?: (data: MemberFormData) => void
  onValidationChange?: (isValid: boolean) => void
  showSubmit?: boolean
}

const inputClassName = 'py-5 pl-10 sm:py-6 sm:pl-11 md:py-7 md:pl-12 lg:py-8'
const iconClassName = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5'

const FormMember = ({ memberId, onFocus, onSave, onValidationChange, showSubmit = true }: FormMemberProps) => {
  const storageKey = `biodata-member-${memberId}`
  const [hasSaved, setHasSaved] = useState(false)

  const getSavedData = (): Partial<MemberFormData> => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  const form = useForm<MemberFormData>({
    mode: 'onChange',
    resolver: zodResolver(memberSchema),
    defaultValues: {
      namaLengkap: '',
      nomorTelepon: '',
      jenjangPendidikan: '',
      ...getSavedData(),
    },
  })

  const { isValid } = form.formState
  const watchedValues = form.watch()
  const [lastSavedValues, setLastSavedValues] = useState<MemberFormData | null>(null)

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

  const onSubmit = (data: MemberFormData) => {
    localStorage.setItem(storageKey, JSON.stringify(data))
    setLastSavedValues(data)
    setHasSaved(true)
    if (onSave) onSave(data)
  }

  return (
    <form
      id={`member-form-${memberId}`}
      onSubmit={form.handleSubmit(onSubmit)}
      className="relative z-10 space-y-4"
      onFocus={onFocus}
    >
      <FieldGroup className="gap-4 sm:gap-5">
        <Controller
          name="namaLengkap"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xl">Nama Lengkap</FieldLabel>

              <div className="relative">
                <User className={iconClassName} />

                <Input
                  {...field}
                  placeholder="Masukkan nama lengkap"
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
          name="nomorTelepon"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xl">Nomor Telepon</FieldLabel>

              <div className="relative">
                <Phone className={iconClassName} />

                <Input
                  {...field}
                  type="tel"
                  placeholder="Masukkan nomor telepon"
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
          name="jenjangPendidikan"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xl">Jenjang Pendidikan</FieldLabel>

              <div className="relative">
                <GraduationCap className={iconClassName} />

                <Input
                  {...field}
                  placeholder="Masukkan jenjang pendidikan"
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

      {showSubmit && (
        <div className="flex justify-center mt-6">
          <Button
            type="submit"
            form={`member-form-${memberId}`}
            className="px-8 py-3 bg-primary text-white hover:bg-primary/80"
            disabled={!isValid || form.formState.isSubmitting || hasSaved}
          >
            {hasSaved ? 'Tersimpan' : 'Simpan'}
          </Button>
        </div>
      )}
    </form>
  )
}

export default FormMember