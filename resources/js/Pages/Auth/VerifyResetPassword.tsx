import React from 'react'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { VerifyResetPasswordForm } from '@/features/auth/components/VerifyResetPasswordForm'

const VerifyResetPassword = () => (
  <AuthShell title="Verifikasi Reset Password" description="Masukkan kode OTP reset password.">
    <VerifyResetPasswordForm />
  </AuthShell>
)

VerifyResetPassword.layout = (page: React.ReactNode) => (
  <AuthLayout title="Verifikasi Reset Password" description="Verifikasi kode OTP reset password." noindex>
    {page}
  </AuthLayout>
)

export default VerifyResetPassword
