import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  verifyResetPasswordSchema,
  type VerifyResetPasswordInput,
} from '../schemas'
import { useVerifyResetCode } from '../hooks/useAuth'
import { OtpInput } from './OtpInput'

export function VerifyResetPasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  )
  const verifyMutation = useVerifyResetCode()

  const form = useForm<VerifyResetPasswordInput>({
    resolver: zodResolver(verifyResetPasswordSchema),
    defaultValues: {
      code: '',
    },
  })

  const handleSubmit = async (
    data: VerifyResetPasswordInput,
  ) => {
    setSuccessMessage(null)

    try {
      const response = await verifyMutation.mutateAsync({
        ...data,
        email:
          window.sessionStorage.getItem('isac.resetEmail') ?? '',
      })

      setSuccessMessage(response.message)

      window.sessionStorage.setItem(
        'isac.resetToken',
        response.data.resetToken,
      )

      router.visit(response.data.redirectTo)
    } catch {
      return
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <span
        aria-hidden="true"
        className="auth-border-crown"
      />
      <span
        aria-hidden="true"
        className="auth-border-surge"
      />

      <Card className="relative z-10 w-full rounded-xl border-0 bg-background/40 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 px-4 pb-5 pt-5 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
            <div className="h-1 w-6 shrink-0 rounded-full bg-gradient-to-r from-primary to-secondary xs:w-8 sm:h-1.5 sm:w-10" />

            <CardTitle className="min-w-0 text-center text-lg font-bold tracking-tight text-foreground xs:text-xl sm:text-2xl">
              VERIFIKASI RESET
            </CardTitle>

            <div className="h-1 w-6 shrink-0 rounded-full bg-gradient-to-l from-primary to-secondary xs:w-8 sm:h-1.5 sm:w-10" />
          </div>

          <CardDescription className="px-1 text-center text-xs leading-relaxed text-muted-foreground sm:px-4 sm:text-sm">
            Masukkan kode OTP reset password dari email Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <FieldGroup className="space-y-4 sm:space-y-5">
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="min-w-0"
                  >
                    <FieldLabel className="text-center text-xs font-semibold uppercase tracking-wider text-white">
                      Kode OTP
                    </FieldLabel>

                    <OtpInput
                      value={field.value}
                      onChange={field.onChange}
                      invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="break-words text-xs sm:text-sm"
                      />
                    )}
                  </Field>
                )}
              />

              {successMessage && (
                <p
                  className="break-words text-center text-xs font-medium text-emerald-400 sm:text-left sm:text-sm"
                  role="status"
                >
                  {successMessage}
                </p>
              )}

              {verifyMutation.error && (
                <p
                  className="break-words text-center text-xs font-medium text-red-400 sm:text-left sm:text-sm"
                  role="alert"
                >
                  {verifyMutation.error.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={verifyMutation.isPending}
                className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] sm:h-12"
              >
                {verifyMutation.isPending
                  ? 'MEMVERIFIKASI...'
                  : 'VERIFIKASI'}
              </Button>

              <div className="flex items-center justify-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-center text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:underline sm:text-sm"
                >
                  Kirim ulang dari awal
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}