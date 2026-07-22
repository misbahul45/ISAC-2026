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
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isVerificationRedirectPending, setIsVerificationRedirectPending] = useState(false);
    const loginMutation = useLogin();
    const isBusy = loginMutation.isPending || isVerificationRedirectPending;

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
                await new Promise((resolve) => window.setTimeout(resolve, 900));
            }

            router.visit(response.data.redirectTo ?? '/dashboard');
        } catch {
            return;
        }
    }

    return (
        <div className="relative w-lg">
            <span aria-hidden="true" className="auth-border-crown" />
            <span aria-hidden="true" className="auth-border-halo" />

            <Card className="relative z-10 w-full rounded-2xl border-0 bg-background/20 backdrop-blur-sm shadow-2xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-primary to-secondary" />
                        <CardTitle className="text-center text-2xl font-bold tracking-tight text-foreground">
                            LOGIN
                        </CardTitle>
                        <div className="h-1.5 w-10 rounded-full bg-gradient-to-l from-primary to-secondary" />
                    </div>
                    <CardDescription className="text-center text-sm text-muted-foreground">
                        Masukkan kredensial untuk memulai sesi
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                        <FieldGroup className="space-y-5">
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-white">
                                            Email
                                        </FieldLabel>

                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type="email"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="player@game.com"
                                                autoComplete="email"
                                                className="h-12 rounded-xl border-border/50 bg-background/60 pl-10 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20"
                                            />
                                        </div>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className="flex items-center justify-between">
                                            <FieldLabel htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-white">
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
                                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={showPassword ? 'text' : 'password'}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                className="h-12 rounded-xl border-border/50 bg-background/60 pl-10 pr-10 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20"
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>

                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="remember"
                                control={form.control}
                                render={({ field }) => (
                                    <Field orientation="horizontal" className="items-center gap-3">
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <FieldLabel className="text-sm text-muted-foreground">
                                            Ingat sesi login
                                        </FieldLabel>
                                    </Field>
                                )}
                            />

                            {isVerificationRedirectPending && (
                                <div
                                    className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-primary"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                                    <div>
                                        <p className="text-sm font-semibold">Email belum terverifikasi</p>
                                        <p className="text-xs text-muted-foreground">
                                            Kode baru telah dikirim. Mengarahkan ke halaman verifikasi...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {successMessage && !isVerificationRedirectPending && (
                                <p className="text-sm font-medium text-emerald-400" role="status">
                                    {successMessage}
                                </p>
                            )}

                            {loginMutation.error && (
                                <p className="text-sm font-medium text-red-400" role="alert">
                                    {loginMutation.error.message}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isBusy}
                                className="h-12 w-full rounded-xl bg-primary font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isVerificationRedirectPending
                                    ? 'MENUJU VERIFIKASI...'
                                    : loginMutation.isPending
                                      ? 'MEMERIKSA AKUN...'
                                      : 'MASUK'}
                            </Button>

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <span className="text-sm text-muted-foreground">Belum punya akun?</span>
                                <Link
                                    href="/auth/register"
                                    className="text-sm font-semibold text-secondary transition-colors hover:text-secondary/80 hover:underline"
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
