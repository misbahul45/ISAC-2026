import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, MapPin, Phone, Users } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import {
  createRegistrasiTeamFormSchema,
  type RegisterTeamFormInput,
} from '../schemas/RegistrasiTeam'
import { useUpdateTeam } from '../hooks/useRegistration'
import type { CompetitionType } from '../types/registrationTypes'
import { serializeInstitutionAddress } from '../utils/institutionAddress'
import { ApiClientError } from '@/lib/api'

type Props = {
  competitionType: CompetitionType
  defaultValues?: Partial<RegisterTeamFormInput>
}

const inputClassName = 'py-5 pl-10 sm:py-6 sm:pl-11 md:py-7 md:pl-12 lg:py-8'
const iconClassName =
  'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5'
const addressFields = [
  { name: 'province' as const, label: 'Provinsi', placeholder: 'Contoh: Jawa Timur' },
  { name: 'city' as const, label: 'Kota/Kabupaten', placeholder: 'Contoh: Surabaya' },
  { name: 'address' as const, label: 'Alamat Lengkap', placeholder: 'Masukkan jalan, nomor, kecamatan, dan kode pos' },
]

const FormRegistrasiTeam = ({ competitionType, defaultValues }: Props) => {
  const updateTeamMutation = useUpdateTeam()
  const form = useForm<RegisterTeamFormInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(createRegistrasiTeamFormSchema(competitionType)),
    defaultValues: {
      name: '',
      phone: '',
      institution_name: '',
      province: '',
      city: '',
      address: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name ?? '',
        phone: defaultValues.phone ?? '',
        institution_name: defaultValues.institution_name ?? '',
        province: defaultValues.province ?? '',
        city: defaultValues.city ?? '',
        address: defaultValues.address ?? '',
      })
    }
  }, [defaultValues, form])

  const onSubmit = async (data: RegisterTeamFormInput) => {
    toast.loading('Menyimpan data tim...')
    try {
      const response = await updateTeamMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
        institution_name: data.institution_name,
        institution_address: serializeInstitutionAddress({
          province: data.province,
          city: data.city,
          address: data.address,
        }),
      })
      toast.dismiss()
      toast.success('Registrasi tim berhasil!', {
        description: 'Mengalihkan ke halaman biodata...',
      })
      router.visit(response.data.redirectTo)
    } catch (error) {
      toast.dismiss()
      if (error instanceof ApiClientError) {
        const fields: (keyof RegisterTeamFormInput)[] = [
          'name',
          'phone',
          'institution_name',
          'province',
          'city',
          'address',
        ]
        fields.forEach((field) => {
          const message = error.fields[field]?.[0]
          if (message) form.setError(field, { type: 'server', message })
        })
        const addressMessage = error.fields.institution_address?.[0]
        if (addressMessage) {
          form.setError('address', { type: 'server', message: addressMessage })
        }
      }
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyimpan data tim.',
      )
    }
  }

  return (
    <Card className="w-full bg-transparent backdrop-blur-sm">
      <CardContent>
        <form
          id="registrasi-team-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <FieldGroup className="gap-4 sm:gap-5">
            <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xl">Nama Tim</FieldLabel>

                      <div className="relative">
                        <Users className={iconClassName} />

                        <Input
                          {...field}
                          placeholder="Masukkan nama tim"
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
                  name="institution_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xl">
                        {competitionType === 'BUSINESS_IT_CASE'
                          ? 'Nama Perguruan Tinggi'
                          : 'Nama Sekolah'}
                      </FieldLabel>

                      <div className="relative">
                        <Building2 className={iconClassName} />

                        <Input
                          {...field}
                          placeholder={
                            competitionType === 'BUSINESS_IT_CASE'
                              ? 'Contoh: Universitas Indonesia'
                              : 'Contoh: SMA Negeri 1 Surabaya'
                          }
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
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xl">Nomor Telepon</FieldLabel>

                      <div className="relative">
                        <Phone className={iconClassName} />

                        <Input
                          {...field}
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

            </FieldGroup>

            <FieldGroup className="gap-4 sm:gap-5">

            {addressFields.map(({ name, label, placeholder }) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xl">{label}</FieldLabel>

                    <div className="relative">
                      <MapPin className={iconClassName} />

                      <Input
                        {...field}
                        placeholder={placeholder}
                        autoComplete="street-address"
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
          </div>
        </form>
      </CardContent>

      <CardFooter className="mt-4">
        <Button
          type="submit"
          form="registrasi-team-form"
          className="flex-1 sm:w-auto py-6 max-w-[80%] mx-auto cursor-pointer"
          disabled={
            !form.formState.isValid ||
            form.formState.isSubmitting ||
            updateTeamMutation.isPending
          }
        >
          {updateTeamMutation.isPending ? 'Menyimpan...' : 'Lanjut'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default FormRegistrasiTeam
