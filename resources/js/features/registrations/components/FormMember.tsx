import { zodResolver } from '@hookform/resolvers/zod'
import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  IdCard,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { FileUpload, type UploadedFile } from '@/components/shared/FileUpload'
import { memberSchema, type MemberFormData } from '@/features/registrations/schemas/createTeamMember'
import type { MemberFormValues, MemberRole } from '@/features/registrations/types/registrationTypes'

interface FormMemberProps {
  memberId: number
  role: MemberRole
  sortOrder: number
  defaultValues?: MemberFormValues
  onFocus?: () => void
  onSave?: (data: MemberFormValues) => void
  onValidationChange?: (isValid: boolean) => void
  showSubmit?: boolean
}

const emptyValues: MemberFormData = {
  name: '',
  email: '',
  phone: '',
  education_level: '',
  major: '',
  faculty: '',
  student_id: '',
  birth_date: '',
  photo_file_id: null,
}

const inputClassName = 'py-5 pl-10 sm:py-6 sm:pl-11 md:py-7 md:pl-12 lg:py-8'
const iconClassName = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5'

const FormMember = ({
  memberId,
  role,
  sortOrder,
  defaultValues,
  onFocus,
  onSave,
  onValidationChange,
  showSubmit = true,
}: FormMemberProps) => {
  const [hasSaved, setHasSaved] = useState(Boolean(defaultValues))
  const [photo, setPhoto] = useState<UploadedFile>(null)
  const form = useForm<MemberFormData>({
    mode: 'onChange',
    resolver: zodResolver(memberSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    form.reset(defaultValues ? {
      name: defaultValues.name,
      email: defaultValues.email,
      phone: defaultValues.phone,
      education_level: defaultValues.education_level,
      major: defaultValues.major ?? '',
      faculty: defaultValues.faculty ?? '',
      student_id: defaultValues.student_id,
      birth_date: defaultValues.birth_date,
      photo_file_id: defaultValues.photo_file_id,
    } : emptyValues)
    setHasSaved(Boolean(defaultValues))
  }, [defaultValues, form])

  useEffect(() => {
    onValidationChange?.((form.formState.isValid || Boolean(defaultValues)) && hasSaved)
  }, [defaultValues, form.formState.isValid, hasSaved, onValidationChange])

  const onSubmit = (data: MemberFormData) => {
    onSave?.({
      id: defaultValues?.id,
      ...data,
      major: data.major || null,
      faculty: data.faculty || null,
      role,
      sort_order: sortOrder,
    })
    setHasSaved(true)
  }

  const fields = [
    { name: 'name' as const, label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap', type: 'text', Icon: User },
    { name: 'email' as const, label: 'Email Anggota', placeholder: 'Masukkan email anggota', type: 'email', Icon: Mail },
    { name: 'phone' as const, label: 'Nomor Telepon', placeholder: 'Masukkan nomor telepon', type: 'tel', Icon: Phone },
    { name: 'education_level' as const, label: 'Jenjang Pendidikan', placeholder: 'Contoh: SMA atau S1', type: 'text', Icon: GraduationCap },
    { name: 'major' as const, label: 'Jurusan', placeholder: 'Masukkan jurusan jika ada', type: 'text', Icon: BookOpen },
    { name: 'faculty' as const, label: 'Fakultas', placeholder: 'Masukkan fakultas jika ada', type: 'text', Icon: Building2 },
    { name: 'student_id' as const, label: 'NISN / NIM', placeholder: 'Masukkan NISN atau NIM', type: 'text', Icon: IdCard },
    { name: 'birth_date' as const, label: 'Tanggal Lahir', placeholder: '', type: 'date', Icon: CalendarDays },
  ]

  return (
    <form
      id={`member-form-${memberId}`}
      onSubmit={form.handleSubmit(onSubmit)}
      className="relative z-10 space-y-4"
      onFocus={() => {
        setHasSaved(false)
        onFocus?.()
      }}
    >
      <FieldGroup className="gap-4 sm:gap-5">
        {fields.map(({ name, label, placeholder, type, Icon }) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xl">{label}</FieldLabel>
                <div className="relative">
                  <Icon className={iconClassName} />
                  <Input
                    {...field}
                    type={type}
                    placeholder={placeholder}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    className={inputClassName}
                  />
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        ))}

        <Controller
          name="photo_file_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="text-xl">Foto Peserta</FieldLabel>
              <FileUpload
                value={photo}
                onChange={(value) => {
                  setPhoto(value)
                  field.onChange(value?.id ?? null)
                  setHasSaved(false)
                }}
                folder="/member-photos"
                purpose="MEMBER_PHOTO"
                label="Upload Foto Peserta"
                subLabel="JPG, PNG, atau WebP maksimal 5 MB"
                accept="image/png,image/jpeg,image/webp"
                maxSizeMB={5}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
            disabled={!form.formState.isValid || form.formState.isSubmitting || hasSaved}
          >
            {hasSaved ? 'Tersimpan' : 'Simpan'}
          </Button>
        </div>
      )}
    </form>
  )
}

export default FormMember
