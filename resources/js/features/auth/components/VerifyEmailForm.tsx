import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { verifyEmailSchema, type VerifyEmailInput } from '../schemas';
import {
    useResendVerification,
    useVerifyEmail,
} from '../hooks/useAuth';
import { OtpInput } from './OtpInput';

const RESEND_COOLDOWN_SECONDS = 60;
export function VerifyEmailForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const verifyEmailMutation = useVerifyEmail();
    const resendVerificationMutation = useResendVerification();

    const form = useForm<VerifyEmailInput>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            code: '',
        },
    });

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    async function handleSubmit(data: VerifyEmailInput) {
        setSuccessMessage(null);
        try {
            const response = await verifyEmailMutation.mutateAsync({ code: data.code });
            setSuccessMessage(response.message);
            router.visit(response.data.redirectTo);
        } catch {
            return;
        }
    }

    async function handleResend() {
        if (cooldown > 0) {
            return;
        }

        try {
            const response = await resendVerificationMutation.mutateAsync();
            setSuccessMessage(response.message);
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch {
            return;
        }
    }

    return (
        <div className="relative w-lg">
            <span aria-hidden="true" className="auth-border-ribbon" />
            <span aria-hidden="true" className="auth-border-diamond" />

            <Card className="relative z-10 w-full rounded-xl border-0 bg-background/20 backdrop-blur-sm shadow-2xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-secondary to-primary" />
                        <CardTitle className="text-center text-2xl font-bold tracking-tight text-foreground">
                            VERIFIKASI EMAIL
                        </CardTitle>
                        <div className="h-1.5 w-10 rounded-full bg-gradient-to-l from-secondary to-primary" />
                    </div>
                    <CardDescription className="text-center text-sm text-muted-foreground">
                        Masukkan kode OTP yang dikirim ke email akun Anda
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                        <FieldGroup className="space-y-5">
                            <Controller
                                name="code"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel className="text-center text-xs font-semibold uppercase tracking-wider text-white">
                                            Kode OTP
                                        </FieldLabel>

                                        <OtpInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            invalid={fieldState.invalid}
                                        />

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            {successMessage && (
                                <p className="text-sm font-medium text-emerald-400" role="status">
                                    {successMessage}
                                </p>
                            )}

                            {(verifyEmailMutation.error ||
                                resendVerificationMutation.error) && (
                                <p className="text-sm font-medium text-red-400" role="alert">
                                    {verifyEmailMutation.error?.message ??
                                        resendVerificationMutation.error?.message}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={verifyEmailMutation.isPending}
                                className="h-12 w-full rounded-xl bg-primary font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {verifyEmailMutation.isPending ? 'MEMVERIFIKASI...' : 'VERIFIKASI'}
                            </Button>

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <span className="text-sm text-muted-foreground">Tidak menerima kode?</span>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={
                                        cooldown > 0 ||
                                        resendVerificationMutation.isPending
                                    }
                                    className="text-sm font-semibold text-secondary transition-colors hover:text-secondary/80 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                                >
                                    {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim Ulang'}
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:underline"
                                >
                                    Kembali ke Login
                                </Link>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
