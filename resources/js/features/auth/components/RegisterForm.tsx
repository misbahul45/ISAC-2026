import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
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
import { registerSchema, type RegisterInput } from '../schemas';
import { useRegister } from '../hooks/useAuth';

export function RegisterForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const registerMutation = useRegister();

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            password_confirmation: '',
        },
    });

    async function handleSubmit(data: RegisterInput) {
        setSuccessMessage(null);

        try {
            const response =
                await registerMutation.mutateAsync(data);

            setSuccessMessage(response.message);

            router.visit(
                response.data.redirectTo ??
                    '/auth/verify-email',
            );
        } catch {
            return;
        }
    }

    return (
        <div className="relative mx-auto w-full max-w-xl">
            <span
                aria-hidden="true"
                className="auth-border-ribbon"
            />

            <span
                aria-hidden="true"
                className="auth-border-diamond"
            />

            <Card className="relative z-10 w-full overflow-hidden rounded-xl border-0 bg-background/20 shadow-2xl backdrop-blur-sm sm:rounded-2xl">
                <CardHeader className="space-y-2 px-4 pb-5 pt-5 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-6">
                    <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                        <div className="h-1 w-6 shrink-0 rounded-full bg-linear-to-r from-secondary to-primary sm:h-1.5 sm:w-10" />

                        <CardTitle className="min-w-0 text-center text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            REGISTER
                        </CardTitle>

                        <div className="h-1 w-6 shrink-0 rounded-full bg-linear-to-l from-secondary to-primary sm:h-1.5 sm:w-10" />
                    </div>

                    <CardDescription className="px-1 text-center text-xs leading-relaxed text-muted-foreground sm:px-4 sm:text-sm">
                        Buat akun baru untuk bergabung dalam
                        kompetisi
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
                                            Password
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
                                                className="h-11 w-full rounded-xl border-border/50 bg-background/60 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 sm:h-12 sm:pl-10 sm:text-base"
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
                                                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-foreground"
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
                                            Konfirmasi Password
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
                                                placeholder="Ulangi password"
                                                autoComplete="new-password"
                                                className="h-11 w-full rounded-xl border-border/50 bg-background/60 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 sm:h-12 sm:pl-10 sm:text-base"
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
                                                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-foreground"
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

                            {registerMutation.error && (
                                <p
                                    className="break-words text-center text-xs font-medium text-red-400 sm:text-left sm:text-sm"
                                    role="alert"
                                >
                                    {
                                        registerMutation.error
                                            .message
                                    }
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={
                                    registerMutation.isPending
                                }
                                className="h-11 w-full rounded-xl bg-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] sm:h-12 sm:px-4 sm:text-sm"
                            >
                                {registerMutation.isPending
                                    ? 'MEMPROSES...'
                                    : 'DAFTAR'}
                            </Button>

                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-1 text-center sm:pt-2">
                                <span className="text-xs text-muted-foreground sm:text-sm">
                                    Sudah punya akun?
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