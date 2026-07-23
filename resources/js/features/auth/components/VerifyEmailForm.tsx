import { useEffect, useState } from 'react'
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
import { verifyEmailSchema, type VerifyEmailInput } from '../schemas'
import {
  useResendVerification,
  useVerifyEmail,
} from '../hooks/useAuth'
import { OtpInput } from './OtpInput'

const RESEND_COOLDOWN_SECONDS = 60

export function VerifyEmailForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  )
  const [cooldown, setCooldown] = useState(0)
  const verifyEmailMutation = useVerifyEmail()
  const resendVerificationMutation = useResendVerification()

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
    },
  })

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  async function handleSubmit(data: VerifyEmailInput) {
    setSuccessMessage(null)

    try {
      const response = await verifyEmailMutation.mutateAsync({
        code: data.code,
      })

      setSuccessMessage(response.message)
      router.visit(response.data.redirectTo)
    } catch {
      return
    }
  }

  async function handleResend() {
    if (cooldown > 0) {
      return
    }

    try {
      const response =
        await resendVerificationMutation.mutateAsync()

      setSuccessMessage(response.message)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      return
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <span
        aria-hidden="true"
        className="auth-border-ribbon"
      />
      <span
        aria-hidden="true"
        className="auth-border-diamond"
      />

      <Card className="relative z-10 w-full rounded-xl border-0 bg-background/20 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 px-4 pb-5 pt-5 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
            <div className="h-1 w-6 shrink-0 rounded-full bg-gradient-to-r from-secondary to-primary xs:w-8 sm:h-1.5 sm:w-10" />

            <CardTitle className="min-w-0 text-center text-lg font-bold tracking-tight text-foreground xs:text-xl sm:text-2xl">
              VERIFIKASI EMAIL
            </CardTitle>

            <div className="h-1 w-6 shrink-0 rounded-full bg-gradient-to-l from-secondary to-primary xs:w-8 sm:h-1.5 sm:w-10" />
          </div>

          <CardDescription className="px-1 text-center text-xs leading-relaxed text-muted-foreground sm:px-4 sm:text-sm">
            Masukkan kode OTP yang dikirim ke email akun Anda
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

              {(verifyEmailMutation.error ||
                resendVerificationMutation.error) && (
                <p
                  className="break-words text-center text-xs font-medium text-red-400 sm:text-left sm:text-sm"
                  role="alert"
                >
                  {verifyEmailMutation.error?.message ??
                    resendVerificationMutation.error?.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={verifyEmailMutation.isPending}
                className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] sm:h-12"
              >
                {verifyEmailMutation.isPending
                  ? 'MEMVERIFIKASI...'
                  : 'VERIFIKASI'}
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-1 text-center sm:pt-2">
                <span className="text-xs text-muted-foreground sm:text-sm">
                  Tidak menerima kode?
                </span>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    cooldown > 0 ||
                    resendVerificationMutation.isPending
                  }
                  className="text-xs font-semibold text-secondary transition-colors hover:text-secondary/80 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline sm:text-sm"
                >
                  {cooldown > 0
                    ? `Kirim ulang (${cooldown}s)`
                    : 'Kirim Ulang'}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  href="/auth/login"
                  className="text-center text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:underline sm:text-sm"
                >
                  Kembali ke Login
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}