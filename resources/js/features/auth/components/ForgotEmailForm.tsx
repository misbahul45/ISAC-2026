import { useState } from 'react';
import { Link } from '@inertiajs/react';
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

export function ForgotEmailForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const form = useForm<ForgotEmailInput>({
        resolver: zodResolver(forgotEmailSchema),
        defaultValues: {
            email: '',
        },
    });

    function handleSubmit(data: ForgotEmailInput) {
        console.log(data);
        setSuccessMessage('Kode verifikasi telah dikirim ke email Anda.');
    }

    return (
        <div className="relative w-lg">
            <span aria-hidden="true" className="auth-border-arena" />
            <span aria-hidden="true" className="auth-border-strike" />

            <Card className="relative z-10 w-full rounded-xl border-0 bg-background/20 backdrop-blur-sm shadow-2xl">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-primary to-secondary" />
                        <CardTitle className="text-center text-2xl font-bold tracking-tight text-foreground">
                            LUPA PASSWORD
                        </CardTitle>
                        <div className="h-1.5 w-10 rounded-full bg-gradient-to-l from-primary to-secondary" />
                    </div>
                    <CardDescription className="text-center text-sm text-muted-foreground">
                        Masukkan email terdaftar untuk menerima kode verifikasi
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

                            {successMessage && (
                                <p className="text-sm font-medium text-emerald-400" role="status">
                                    {successMessage}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-primary font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                KIRIM KODE
                            </Button>

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <span className="text-sm text-muted-foreground">Sudah ingat password?</span>
                                <Link
                                    href="/auth/login"
                                    className="text-sm font-semibold text-secondary transition-colors hover:text-secondary/80 hover:underline"
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