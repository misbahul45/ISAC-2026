import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
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
import { changePasswordSchema, type ChangePasswordInput } from '../schemas';

export function ChangePasswordForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpFromQuery, setOtpFromQuery] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const form = useForm<ChangePasswordInput>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            otp: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryOtp = params.get('otp');
        const queryEmail = params.get('email');

        setEmail(queryEmail);

        if (queryOtp) {
            setOtpFromQuery(queryOtp);
            form.setValue('otp', queryOtp);
        }
    }, [form]);

    function handleSubmit(data: ChangePasswordInput) {
        console.log(data);
        setSuccessMessage('Password berhasil diubah. Silakan masuk kembali.');
    }

    return (
        <div className="relative w-lg">
            <span aria-hidden="true" className="auth-border-crown" />
            <span aria-hidden="true" className="auth-border-surge" />

            <Card className="relative z-10 w-full rounded-2xl border-0 bg-background/40 backdrop-blur-sm shadow-2xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[2px] w-10 rounded-full bg-gradient-to-r from-primary to-secondary" />
                        <CardTitle className="text-center text-2xl font-bold tracking-tight text-foreground">
                            UBAH PASSWORD
                        </CardTitle>
                        <div className="h-[2px] w-10 rounded-full bg-gradient-to-l from-primary to-secondary" />
                    </div>
                    <CardDescription className="text-center text-sm text-muted-foreground">
                        {email
                            ? `Buat password baru untuk ${email}`
                            : 'Buat password baru untuk akun Anda'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                        <FieldGroup className="space-y-5">
                            {!otpFromQuery && (
                                <Controller
                                    name="otp"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-white">
                                                Kode OTP
                                            </FieldLabel>

                                            <div className="relative">
                                                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                                                <Input
                                                    {...field}
                                                    id={field.name}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    aria-invalid={fieldState.invalid}
                                                    placeholder="123456"
                                                    autoComplete="one-time-code"
                                                    className="h-12 rounded-xl border-border/50 bg-background/60 pl-10 text-center text-lg tracking-[0.5em] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20"
                                                />
                                            </div>

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            )}

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-white">
                                            Password Baru
                                        </FieldLabel>

                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={showPassword ? 'text' : 'password'}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Minimal 8 karakter"
                                                autoComplete="new-password"
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
                                name="confirmPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-white">
                                            Konfirmasi Password Baru
                                        </FieldLabel>

                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                                            <Input
                                                {...field}
                                                id={field.name}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                aria-invalid={fieldState.invalid}
                                                placeholder="Ulangi password baru"
                                                autoComplete="new-password"
                                                className="h-12 rounded-xl border-border/50 bg-background/60 pl-10 pr-10 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20"
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                                            >
                                                {showConfirmPassword ? (
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

                            {successMessage && (
                                <p className="text-sm font-medium text-emerald-400" role="status">
                                    {successMessage}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-primary font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                SIMPAN PASSWORD
                            </Button>

                            <div className="flex items-center justify-center gap-2 pt-2">
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