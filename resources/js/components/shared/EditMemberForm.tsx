import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { User, Phone, GraduationCap, X, Check } from 'lucide-react'
import { memberDetailSchema, type MemberDetailInput } from '@/schemas/teamAccount'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface EditMemberFormProps {
  defaultValues: MemberDetailInput
  title: string
  onSave: (data: MemberDetailInput) => void
  onCancel: () => void
}

const iconClassName = 'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8891BB] transition-colors duration-300 group-focus-within:text-[#8B5CFF]'
const inputClassName = 'w-full py-6 pl-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-[#8891BB] backdrop-blur-md transition-all duration-300 focus-visible:border-[#8B5CFF]/60 focus-visible:ring-[3px] focus-visible:ring-[#8B5CFF]/25'

const memberFields = [
  { name: 'namaLengkap' as const, label: 'Nama Lengkap', icon: User, placeholder: 'Masukkan nama lengkap' },
  { name: 'nomorTelepon' as const, label: 'Nomor Telepon', icon: Phone, placeholder: 'Masukkan nomor telepon' },
  { name: 'jenjangPendidikan' as const, label: 'Jenjang Pendidikan', icon: GraduationCap, placeholder: 'Masukkan jenjang pendidikan' },
]

const EditMemberForm = ({ defaultValues, title, onSave, onCancel }: EditMemberFormProps) => {
  const formRef = React.useRef<HTMLFormElement>(null)

  const form = useForm<Omit<MemberDetailInput, 'id'>>({
    mode: 'onChange',
    resolver: zodResolver(memberDetailSchema.omit({ id: true })),
    defaultValues: {
      namaLengkap: defaultValues.namaLengkap,
      nomorTelepon: defaultValues.nomorTelepon,
      jenjangPendidikan: defaultValues.jenjangPendidikan,
    },
  })

  const { control } = form

  useGSAP(() => {
    if (!formRef.current) return
    const fields = formRef.current.querySelectorAll('.gsap-field')
    const actions = formRef.current.querySelectorAll('.gsap-button')

    gsap.from(fields, {
      y: 32,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    })

    gsap.from(actions, {
      y: 24,
      opacity: 0,
      duration: 0.5,
      delay: 0.35,
      ease: 'power3.out',
    })
  }, { scope: formRef })

  return (
    <div className="relative w-full rounded-3xl">
      <style>{`
        @keyframes border-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="absolute inset-[-45%] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#8B5CFF_70deg,#5B3FBF_140deg,transparent_210deg,transparent_360deg)] opacity-80 blur-md [animation:border-spin_6s_linear_infinite]" />
      <Card className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0E23]/70 shadow-[0_20px_60px_-20px_rgba(139,92,255,0.4)] backdrop-blur-2xl">
        <form
          ref={formRef}
          onSubmit={form.handleSubmit((data) => onSave({ ...data, id: defaultValues.id }))}
          className="w-full"
        >
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-6 py-6 sm:px-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit {title}</h2>
              <p className="mt-1 text-sm text-[#8891BB]">Perbarui data anggota tim</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#8891BB] backdrop-blur-md transition-all duration-300 hover:border-[#FF5C5C]/40 hover:bg-[#FF5C5C]/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>

          <CardContent className="px-6 py-8 sm:px-8">
            <FieldGroup className="gap-5">
              {memberFields.map((item) => (
                <Controller
                  key={item.name}
                  name={item.name}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gsap-field group">
                      <FieldLabel className="text-sm font-medium text-white">{item.label}</FieldLabel>
                      <div className="relative">
                        <item.icon className={iconClassName} />
                        <Input
                          {...field}
                          placeholder={item.placeholder}
                          aria-invalid={fieldState.invalid}
                          className={inputClassName}
                        />
                        <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#8B5CFF] to-[#5B3FBF] transition-transform duration-300 group-focus-within:scale-x-100" />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              ))}
            </FieldGroup>
          </CardContent>

          <div className="flex gap-3 border-t border-white/5 px-6 py-6 sm:px-8">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="gsap-button flex-1 rounded-xl border border-white/10 bg-white/5 py-6 text-[#8891BB] backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="gsap-button flex-1 gap-2 rounded-xl bg-gradient-to-r from-[#8B5CFF] to-[#5B3FBF] py-6 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_-4px_rgba(139,92,255,0.5)]"
            >
              <Check className="h-4 w-4" />
              Simpan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default EditMemberForm