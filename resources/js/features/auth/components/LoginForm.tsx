import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { loginSchema, type LoginInput } from '../schemas';
import { useLogin } from '../hooks/useAuth';

export function LoginForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );
    const [showPassword, setShowPassword] = useState(false);
    const [
        isVerificationRedirectPending,
        setIsVerificationRedirectPending,
    ] = useState(false);

    const loginMutation = useLogin();

    const isBusy =
        loginMutation.isPending || isVerificationRedirectPending;

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    async function handleSubmit(data: LoginInput) {
        setSuccessMessage(null);

        try {
            const response = await loginMutation.mutateAsync(data);

            setSuccessMessage(response.message);

            if (response.data.emailVerificationRequired) {
                setIsVerificationRedirectPending(true);

                await new Promise((resolve) =>
                    window.setTimeout(resolve, 900),
                );
            }

            router.visit(
                response.data.redirectTo ?? '/dashboard',
            );
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
                className="auth-border-halo"
            />

            <Card className="relative z-10 w-full overflow-hidden rounded-xl border-0 bg-background/20 shadow-2xl backdrop-blur-sm sm:rounded-2xl">
                <CardHeader className="space-y-2 px-4 pb-5 pt-5 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-6">
                    <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                        <div className="h-1 w-6 shrink-0 rounded-full bg-gradient-to-r from-primary to-secondary sm:h-1.5 sm:w-10" />

                        <CardTitle className="min-w-0 text-center text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            LOGIN
                        </CardTitle>

                        <div className="h-1 w-6 shrink-0 rounded-full bg-gradient-to-l from-primary to-secondary sm:h-1.5 sm:w-10" />
                    </div>

                    <CardDescription className="px-1 text-center text-xs leading-relaxed text-muted-foreground sm:px-4 sm:text-sm">
                        Masukkan kredensial untuk memulai sesi
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
                                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                            <FieldLabel
                                                htmlFor={field.name}
                                                className="text-xs font-semibold uppercase tracking-wider text-white"
                                            >
                                                Password
                                            </FieldLabel>

                                            <Link
                                                href="/auth/forgot-password"
                                                className="text-xs text-primary transition-colors hover:text-primary/80 hover:underline"
                                            >
                                                Lupa Password?
                                            </Link>
                                        </div>

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
                                                placeholder="••••••••"
                                                autoComplete="current-password"
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
                                name="remember"
                                control={form.control}
                                render={({ field }) => (
                                    <Field
                                        orientation="horizontal"
                                        className="flex min-w-0 items-center gap-2 sm:gap-3"
                                    >
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={
                                                field.onChange
                                            }
                                            className="shrink-0"
                                        />

                                        <FieldLabel className="min-w-0 text-xs text-muted-foreground sm:text-sm">
                                            Ingat sesi login
                                        </FieldLabel>
                                    </Field>
                                )}
                            />

                            {isVerificationRedirectPending && (
                                <div
                                    className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-primary sm:items-center sm:gap-3 sm:px-4"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin sm:mt-0 sm:h-5 sm:w-5" />

                                    <div className="min-w-0">
                                        <p className="break-words text-xs font-semibold sm:text-sm">
                                            Email belum
                                            terverifikasi
                                        </p>

                                        <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">
                                            Kode baru telah
                                            dikirim. Mengarahkan
                                            ke halaman
                                            verifikasi...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {successMessage &&
                                !isVerificationRedirectPending && (
                                    <p
                                        className="break-words text-center text-xs font-medium text-emerald-400 sm:text-left sm:text-sm"
                                        role="status"
                                    >
                                        {successMessage}
                                    </p>
                                )}

                            {loginMutation.error && (
                                <p
                                    className="break-words text-center text-xs font-medium text-red-400 sm:text-left sm:text-sm"
                                    role="alert"
                                >
                                    {
                                        loginMutation.error
                                            .message
                                    }
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isBusy}
                                className="h-11 w-full rounded-xl bg-primary px-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] sm:h-12 sm:px-4 sm:text-sm"
                            >
                                {isBusy && (
                                    <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                                )}

                                <span className="truncate">
                                    {isVerificationRedirectPending
                                        ? 'MENUJU VERIFIKASI...'
                                        : loginMutation.isPending
                                          ? 'MEMERIKSA AKUN...'
                                          : 'MASUK'}
                                </span>
                            </Button>

                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-1 text-center sm:pt-2">
                                <span className="text-xs text-muted-foreground sm:text-sm">
                                    Belum punya akun?
                                </span>

                                <Link
                                    href="/auth/register"
                                    className="text-xs font-semibold text-secondary transition-colors hover:text-secondary/80 hover:underline sm:text-sm"
                                >
                                    Daftar Sekarang
                                </Link>
                            </div>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}