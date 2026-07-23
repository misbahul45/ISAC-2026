import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { forgotEmailSchema, type ForgotEmailInput } from '../schemas';
import { useForgotPassword } from '../hooks/useAuth';

export function ForgotEmailForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );

    const forgotPasswordMutation = useForgotPassword();

    const form = useForm<ForgotEmailInput>({
        resolver: zodResolver(forgotEmailSchema),
        defaultValues: {
            email: '',
        },
    });

    async function handleSubmit(data: ForgotEmailInput) {
        setSuccessMessage(null);

        try {
            const response =
                await forgotPasswordMutation.mutateAsync(data);

            setSuccessMessage(response.message);

            window.sessionStorage.setItem(
                'isac.resetEmail',
                data.email,
            );

            router.visit('/auth/reset-password/verify');
        } catch {
            return;
        }
    }

    return (
        <div className="relative mx-auto w-full max-w-lg rounded-2xl">
            <span
                aria-hidden="true"
                className="auth-border-arena"
            />

            <span
                aria-hidden="true"
                className="auth-border-strike"
            />

            <Card className="relative z-10 w-full overflow-hidden rounded-2xl border-0 bg-background/20 shadow-2xl backdrop-blur-sm sm:rounded-2xl">
                <CardHeader className="space-y-2 px-4 pb-5 pt-5 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-6">
                    <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                        <div className="h-1 w-5 shrink-0 rounded-full bg-gradient-to-r from-primary to-secondary sm:h-1.5 sm:w-10" />

                        <CardTitle className="min-w-0 text-center text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                            LUPA PASSWORD
                        </CardTitle>

                        <div className="h-1 w-5 shrink-0 rounded-full bg-gradient-to-l from-primary to-secondary sm:h-1.5 sm:w-10" />
                    </div>

                    <CardDescription className="px-1 text-center text-xs leading-relaxed text-muted-foreground sm:px-4 sm:text-sm">
                        Masukkan email terdaftar untuk menerima kode
                        verifikasi
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        noValidate
                    >
                        <FieldGroup className="space-y-4 sm:space-y-5">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field
                                        data-invalid={
                                            fieldState.invalid
                                        }
                                        className="min-w-0"
                                    >
                                        <FieldLabel
                                            htmlFor={field.name}
                                            className="text-xs font-semibold uppercase tracking-wider text-white"
                                        >
                                            Email
                                        </FieldLabel>

                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 sm:h-5 sm:w-5" />

                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="email"
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="player@game.com"
                                                autoComplete="email"
                                                className="h-11 w-full rounded-xl border-border/50 bg-background/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 sm:h-12 sm:pl-10 sm:text-base"
                                            />
                                        </div>

                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[
                                                    fieldState.error,
                                                ]}
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

                            {forgotPasswordMutation.error && (
                                <p
                                    className="break-words text-center text-xs font-medium text-red-400 sm:text-left sm:text-sm"
                                    role="alert"
                                >
                                    {
                                        forgotPasswordMutation.error
                                            .message
                                    }
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={
                                    forgotPasswordMutation.isPending
                                }
                                className="h-11 w-full rounded-xl bg-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] sm:h-12 sm:px-4 sm:text-sm"
                            >
                                {forgotPasswordMutation.isPending
                                    ? 'MENGIRIM...'
                                    : 'KIRIM KODE'}
                            </Button>

                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-1 text-center sm:pt-2">
                                <span className="text-xs text-muted-foreground sm:text-sm">
                                    Sudah ingat password?
                                </span>

                                <Link
                                    href="/auth/login"
                                    className="text-xs font-semibold text-secondary transition-colors hover:text-secondary/80 hover:underline sm:text-sm"
                                >
                                    Masuk Sekarang
                                </Link>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}