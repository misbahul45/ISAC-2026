import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock } from 'lucide-react';
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
import {
    changePasswordSchema,
    type ChangePasswordInput,
} from '../schemas';
import { useChangePassword } from '../hooks/useAuth';

export function ChangePasswordForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const changePasswordMutation = useChangePassword();

    const form = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            password: '',
            password_confirmation: '',
        },
    });

    async function handleSubmit(data: ChangePasswordInput) {
        setSuccessMessage(null);

        try {
            const response =
                await changePasswordMutation.mutateAsync({
                    reset_token:
                        window.sessionStorage.getItem(
                            'isac.resetToken',
                        ) ?? '',
                    password: data.password,
                    password_confirmation:
                        data.password_confirmation,
                });

            setSuccessMessage(response.message);

            window.sessionStorage.removeItem('isac.resetToken');

            router.visit('/auth/login');
        } catch {
            return;
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

            <Card className="relative z-10 w-full overflow-hidden rounded-xl border-0 bg-background/40 shadow-2xl backdrop-blur-sm sm:rounded-2xl">
                <CardHeader className="space-y-2 px-4 pb-5 pt-5 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-6">
                    <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                        <div className="h-1 w-5 shrink-0 rounded-full bg-gradient-to-r from-primary to-secondary sm:h-1.5 sm:w-10" />

                        <CardTitle className="min-w-0 text-center text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                            UBAH PASSWORD
                        </CardTitle>

                        <div className="h-1 w-5 shrink-0 rounded-full bg-gradient-to-l from-primary to-secondary sm:h-1.5 sm:w-10" />
                    </div>

                    <CardDescription className="px-1 text-center text-xs leading-relaxed text-muted-foreground sm:px-4 sm:text-sm">
                        Buat password baru untuk akun Anda
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        noValidate
                    >
                        <FieldGroup className="space-y-4 sm:space-y-5">
                            <Controller
                                name="password"
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
                                            Password Baru
                                        </FieldLabel>

                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 sm:h-5 sm:w-5" />

                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Minimal 8 karakter"
                                                autoComplete="new-password"
                                                className="h-11 w-full rounded-xl border-border/50 bg-background/60 pl-9 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 sm:h-12 sm:pl-10 sm:text-base"
                                            />

                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() =>
                                                    setShowPassword(
                                                        (prev) =>
                                                            !prev,
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-foreground sm:right-3"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                                                ) : (
                                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                                )}
                                            </button>
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

                            <Controller
                                name="password_confirmation"
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
                                            Konfirmasi Password Baru
                                        </FieldLabel>

                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 sm:h-5 sm:w-5" />

                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={
                                                    showConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                placeholder="Ulangi password baru"
                                                autoComplete="new-password"
                                                className="h-11 w-full rounded-xl border-border/50 bg-background/60 pl-9 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 sm:h-12 sm:pl-10 sm:text-base"
                                            />

                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (prev) =>
                                                            !prev,
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-foreground sm:right-3"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                                                ) : (
                                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                                )}
                                            </button>
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

                            {changePasswordMutation.error && (
                                <p
                                    className="break-words text-center text-xs font-medium text-red-400 sm:text-left sm:text-sm"
                                    role="alert"
                                >
                                    {
                                        changePasswordMutation.error
                                            .message
                                    }
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={
                                    changePasswordMutation.isPending
                                }
                                className="h-11 w-full rounded-xl bg-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] sm:h-12 sm:px-4 sm:text-sm"
                            >
                                {changePasswordMutation.isPending
                                    ? 'MENYIMPAN...'
                                    : 'SIMPAN PASSWORD'}
                            </Button>

                            <div className="flex items-center justify-center pt-1 text-center sm:pt-2">
                                <Link
                                    href="/auth/login"
                                    className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:underline sm:text-sm"
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