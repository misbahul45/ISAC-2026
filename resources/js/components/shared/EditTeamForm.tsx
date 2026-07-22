import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Phone, Users } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { teamDetailSchema, type TeamDetailInput } from '@/schemas/teamAccount'

interface EditTeamFormProps {
  defaultValues: TeamDetailInput
  onSave: (data: TeamDetailInput) => void
  onCancel: () => void
}

const inputClassName =
  'py-5 pl-10 sm:py-6 sm:pl-11 md:py-7 md:pl-12 lg:py-8'
const iconClassName =
  'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5'

const fields = [
  {
    name: 'name' as const,
    label: 'Nama Tim',
    placeholder: 'Masukkan nama tim',
    Icon: Users,
  },
  {
    name: 'institution_name' as const,
    label: 'Nama Institusi',
    placeholder: 'Masukkan nama sekolah atau perguruan tinggi',
    Icon: Building2,
  },
  {
    name: 'phone' as const,
    label: 'Nomor Telepon Tim',
    placeholder: 'Masukkan nomor telepon tim',
    Icon: Phone,
  },
]

const EditTeamForm = ({
  defaultValues,
  onSave,
  onCancel,
}: EditTeamFormProps) => {
  const form = useForm<TeamDetailInput>({
    mode: 'onChange',
    resolver: zodResolver(teamDetailSchema),
    defaultValues,
  })

  return (
    <Card className="w-full bg-transparent backdrop-blur-sm">
      <CardHeader>
        <h2 className="text-2xl font-bold">Edit Data Tim</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Perbarui informasi utama tim Anda
        </p>
      </CardHeader>

      <CardContent>
        <form id="edit-team-form" onSubmit={form.handleSubmit(onSave)}>
          <FieldGroup className="mx-auto max-w-2xl gap-4 sm:gap-5">
            {fields.map(({ name, label, placeholder, Icon }) => (
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
                        placeholder={placeholder}
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
            ))}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="mt-4 gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-6">
          Batal
        </Button>
        <Button type="submit" form="edit-team-form" className="flex-1 py-6">
          Simpan
        </Button>
      </CardFooter>
    </Card>
  )
}

export default EditTeamForm
