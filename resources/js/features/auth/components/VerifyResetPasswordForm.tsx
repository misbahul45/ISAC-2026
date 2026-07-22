import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { verifyResetPasswordSchema, type VerifyResetPasswordInput } from '../schemas'
import { useVerifyResetCode } from '../hooks/useAuth'
import { OtpInput } from './OtpInput'

export function VerifyResetPasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const verifyMutation = useVerifyResetCode()
  const form = useForm<VerifyResetPasswordInput>({
    resolver: zodResolver(verifyResetPasswordSchema),
    defaultValues: { code: '' },
  })

  const handleSubmit = async (data: VerifyResetPasswordInput) => {
    setSuccessMessage(null)
    try {
      const response = await verifyMutation.mutateAsync({ ...data, email: window.sessionStorage.getItem('isac.resetEmail') ?? '' })
      setSuccessMessage(response.message)
      window.sessionStorage.setItem('isac.resetToken', response.data.resetToken)
      router.visit(response.data.redirectTo)
    } catch {
      return
    }
  }

  return (
    <div className="relative w-lg">
      <span aria-hidden="true" className="auth-border-crown" />
      <span aria-hidden="true" className="auth-border-surge" />
      <Card className="relative z-10 w-full rounded-xl border-0 bg-background/40 backdrop-blur-sm shadow-2xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-primary to-secondary" />
            <CardTitle className="text-center text-2xl font-bold tracking-tight text-foreground">VERIFIKASI RESET</CardTitle>
            <div className="h-1.5 w-10 rounded-full bg-gradient-to-l from-primary to-secondary" />
          </div>
          <CardDescription className="text-center text-sm text-muted-foreground">Masukkan kode OTP reset password dari email Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <FieldGroup className="space-y-5">
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-center text-xs font-semibold uppercase tracking-wider text-white">Kode OTP</FieldLabel>
                    <OtpInput value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              {successMessage && <p className="text-sm font-medium text-emerald-400" role="status">{successMessage}</p>}
              {verifyMutation.error && <p className="text-sm font-medium text-red-400" role="alert">{verifyMutation.error.message}</p>}
              <Button type="submit" disabled={verifyMutation.isPending} className="h-12 w-full rounded-xl bg-primary font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]">
                {verifyMutation.isPending ? 'MEMVERIFIKASI...' : 'VERIFIKASI'}
              </Button>
              <div className="flex items-center justify-center gap-2">
                <Link href="/auth/forgot-password" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:underline">Kirim ulang dari awal</Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
