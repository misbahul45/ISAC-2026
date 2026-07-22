import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Building2, Check, IdCard, Mail, User, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { memberDetailSchema, type MemberDetailInput } from '@/schemas/teamAccount'

interface EditMemberFormProps {
  defaultValues: MemberDetailInput
  title: string
  onSave: (data: MemberDetailInput) => void
  onCancel: () => void
}

const iconClassName =
  'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8891BB] transition-colors duration-300 group-focus-within:text-[#8B5CFF]'
const inputClassName =
  'w-full rounded-xl border-white/10 bg-white/5 py-6 pl-12 text-white placeholder:text-[#8891BB] backdrop-blur-md transition-all duration-300 focus-visible:border-[#8B5CFF]/60 focus-visible:ring-[3px] focus-visible:ring-[#8B5CFF]/25'

const memberFields = [
  { name: 'namaLengkap' as const, label: 'Nama Lengkap', Icon: User },
  { name: 'email' as const, label: 'Email Peserta', Icon: Mail },
  { name: 'nomorIdentitas' as const, label: 'NISN / NIM', Icon: IdCard },
  { name: 'jurusan' as const, label: 'Jurusan (Mahasiswa)', Icon: BookOpen },
  { name: 'fakultas' as const, label: 'Fakultas (Mahasiswa)', Icon: Building2 },
]

const EditMemberForm = ({
  defaultValues,
  title,
  onSave,
  onCancel,
}: EditMemberFormProps) => {
  const form = useForm<Omit<MemberDetailInput, 'id'>>({
    mode: 'onChange',
    resolver: zodResolver(memberDetailSchema.omit({ id: true })),
    defaultValues: {
      namaLengkap: defaultValues.namaLengkap,
      email: defaultValues.email,
      nomorIdentitas: defaultValues.nomorIdentitas,
      jurusan: defaultValues.jurusan,
      fakultas: defaultValues.fakultas,
    },
  })

  return (
    <Card className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0E23]/70 backdrop-blur-2xl">
      <form
        onSubmit={form.handleSubmit((data) =>
          onSave({ ...data, id: defaultValues.id }),
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-6 sm:px-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit {title}</h2>
              <p className="mt-1 text-sm text-[#8891BB]">Perbarui data peserta</p>
            </div>
            <button type="button" onClick={onCancel} className="text-[#8891BB]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-8 sm:px-8">
          <FieldGroup className="gap-5">
            {memberFields.map(({ name, label, Icon }) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="group">
                    <FieldLabel className="text-sm font-medium text-white">{label}</FieldLabel>
                    <div className="relative">
                      <Icon className={iconClassName} />
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={`Masukkan ${label.toLowerCase()}`}
                        aria-invalid={fieldState.invalid}
                        className={inputClassName}
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </CardContent>

        <div className="flex gap-3 border-t border-white/5 px-6 py-6 sm:px-8">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Batal
          </Button>
          <Button type="submit" className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            Simpan
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default EditMemberForm
