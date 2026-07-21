import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Map, MapPin, MapPinHouse, Trophy, Users } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { teamDetailSchema, type TeamDetailInput, type CompetitionType } from '@/schemas/teamAccount'

interface EditTeamFormProps {
  defaultValues: TeamDetailInput
  onSave: (data: TeamDetailInput) => void
  onCancel: () => void
}

const inputClassName = 'py-5 pl-10 sm:py-6 sm:pl-11 md:py-7 md:pl-12 lg:py-8'
const iconClassName =
  'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:left-4 sm:h-5 sm:w-5'

const competitionOptions: { value: CompetitionType; label: string; badge: string }[] = [
  { value: 'OLIMPIADE', label: 'Olimpiade', badge: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400' },
  { value: 'BUSINESS_PLAN', label: 'Business Plan', badge: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' },
  { value: 'BUSINESS_IT_CASE', label: 'Business IT Case', badge: 'bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400' },
]

const EditTeamForm = ({ defaultValues, onSave, onCancel }: EditTeamFormProps) => {
  const form = useForm<TeamDetailInput>({
    mode: 'onChange',
    resolver: zodResolver(teamDetailSchema),
    defaultValues,
  })

  return (
    <Card className="w-full bg-transparent backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edit Data Tim</h2>
          <p className="mt-1 text-sm text-muted-foreground">Perbarui informasi tim Anda</p>
        </div>
      </CardHeader>

      <CardContent>
        <form
          id="edit-team-form"
          onSubmit={form.handleSubmit(onSave)}
        >
          <FieldGroup className="gap-4 sm:gap-5">
            <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:gap-6">
              <div className="flex flex-1 flex-col gap-4 sm:gap-5">
                <Controller
                  name="competition_type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xl">Jenis Kompetisi</FieldLabel>

                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          className={cn('relative w-full', inputClassName)}
                        >
                          <Trophy className={iconClassName} />
                          <SelectValue placeholder="Pilih jenis kompetisi">
                            {field.value && (
                              <span
                                className={cn(
                                  'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                  competitionOptions.find((o) => o.value === field.value)?.badge
                                )}
                              >
                                {competitionOptions.find((o) => o.value === field.value)?.label}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {competitionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span
                                className={cn(
                                  'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                  option.badge
                                )}
                              >
                                {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

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
              </div>

              <div className="flex flex-1 flex-col gap-4 sm:gap-5">
                <Controller
                  name="province"
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
                  name="city"
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
                  name="address"
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

      <CardFooter className="mt-4 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 py-6"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="edit-team-form"
          className="flex-1 py-6"
        >
          Simpan
        </Button>
      </CardFooter>
    </Card>
  )
}

export default EditTeamForm