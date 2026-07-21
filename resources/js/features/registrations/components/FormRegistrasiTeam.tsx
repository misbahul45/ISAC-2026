import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Map, MapPin, MapPinHouse, Phone, Users } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import {
  registrasiTeamFormSchema,
  type RegisterTeamFormInput,
  validateInstitution,
} from '../schemas/RegistrasiTeam'
import { useUpdateTeam } from '../hooks/useRegistration'
import type { CompetitionType } from '../types/registrationTypes'

type Props = {
  competitionType: CompetitionType
  defaultValues?: Partial<RegisterTeamFormInput>
}

const inputClassName = 'py-5 pl-10 sm:py-6 sm:pl-11 md:py-7 md:pl-12 lg:py-8'
const iconClassName =
  'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5'

const FormRegistrasiTeam = ({ competitionType, defaultValues }: Props) => {
  const updateTeamMutation = useUpdateTeam()
  const form = useForm<RegisterTeamFormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(registrasiTeamFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      school_name: '',
      school_province: '',
      school_city: '',
      school_address: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name ?? '',
        phone: defaultValues.phone ?? '',
        school_name: defaultValues.school_name ?? '',
        school_province: defaultValues.school_province ?? '',
        school_city: defaultValues.school_city ?? '',
        school_address: defaultValues.school_address ?? '',
      })
    }
  }, [defaultValues, form])

  const onSubmit = async (data: RegisterTeamFormInput) => {
    const institutionError = validateInstitution(
      data.school_name,
      competitionType,
    )

    if (institutionError) {
      form.setError('school_name', { message: institutionError })
      return
    }

    toast.loading('Menyimpan data tim...')
    try {
      const response = await updateTeamMutation.mutateAsync(data)
      toast.dismiss()
      toast.success('Registrasi tim berhasil!', {
        description: 'Mengalihkan ke halaman biodata...',
      })
      router.visit(response.data.redirectTo)
    } catch (error) {
      toast.dismiss()
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
          <FieldGroup className="gap-4 sm:gap-5">
            <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:gap-6">
              <div className="flex flex-1 flex-col gap-4 sm:gap-5">
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
                  name="school_name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xl">Nama Institusi</FieldLabel>

                      <div className="relative">
                        <Building2 className={iconClassName} />

                        <Input
                          {...field}
                          placeholder="Masukkan nama institusi"
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
              </div>

              <div className="flex flex-1 flex-col gap-4 sm:gap-5">
                <Controller
                  name="school_province"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xl">Provinsi</FieldLabel>

                      <div className="relative">
                        <Map className={iconClassName} />

                        <Input
                          {...field}
                          placeholder="Masukkan provinsi"
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
                  name="school_city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xl">Kota / Kabupaten</FieldLabel>

                      <div className="relative">
                        <MapPin className={iconClassName} />

                        <Input
                          {...field}
                          placeholder="Masukkan kota / kabupaten"
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
                  name="school_address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="flex flex-1 flex-col"
                    >
                      <FieldLabel className="text-xl">Alamat Lengkap</FieldLabel>

                      <div className="relative flex flex-1 flex-col">
                        <MapPinHouse className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-muted-foreground sm:left-4 sm:top-5 sm:h-5 sm:w-5" />

                        <Textarea
                          {...field}
                          placeholder="Masukkan alamat lengkap"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                          className={cn(
                            inputClassName,
                            'min-h-28 flex-1 resize-none sm:min-h-32 lg:min-h-0'
                          )}
                        />
                      </div>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="mt-4">
        <Button
          type="submit"
          form="registrasi-team-form"
          className="flex-1 sm:w-auto py-6 max-w-[80%] mx-auto cursor-pointer"
          disabled={form.formState.isSubmitting || updateTeamMutation.isPending}
        >
          {updateTeamMutation.isPending ? 'Menyimpan...' : 'Lanjut'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default FormRegistrasiTeam
