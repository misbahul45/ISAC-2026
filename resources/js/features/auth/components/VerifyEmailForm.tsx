import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { Link } from '@inertiajs/react';
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

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

type OtpInputProps = {
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
};

function OtpInput({ value, onChange, invalid }: OtpInputProps) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    function setDigit(index: number, digit: string) {
        const digits = value.padEnd(OTP_LENGTH, ' ').split('');
        digits[index] = digit || ' ';
        onChange(digits.join('').replace(/\s/g, ''));
    }

    function handleChange(index: number, rawValue: string) {
        const digit = rawValue.replace(/\D/g, '').slice(-1);
        setDigit(index, digit);

        if (digit && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Backspace' && !value[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    }

    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);

        if (!pasted) {
            return;
        }

        onChange(pasted);
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        inputsRef.current[focusIndex]?.focus();
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] ?? ''}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    aria-invalid={invalid}
                    className="h-14 w-12 rounded-xl border border-border/50 bg-background/60 text-center text-xl font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            ))}
        </div>
    );
}

export function VerifyEmailForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const form = useForm<VerifyEmailInput>({
        resolver: zodResolver(verifyEmailSchema),
        defaultValues: {
            otp: '',
        },
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get('email'));
    }, []);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    function handleSubmit(data: VerifyEmailInput) {
        console.log(data);
        setSuccessMessage('Email berhasil diverifikasi.');
    }

    function handleResend() {
        if (cooldown > 0) {
            return;
        }

        console.log('resend otp to', email);
        setCooldown(RESEND_COOLDOWN_SECONDS);
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
                        {email
                            ? `Masukkan kode OTP yang dikirim ke ${email}`
                            : 'Masukkan kode OTP yang dikirim ke email Anda'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                        <FieldGroup className="space-y-5">
                            <Controller
                                name="otp"
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

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-xl bg-primary font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                VERIFIKASI
                            </Button>

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <span className="text-sm text-muted-foreground">Tidak menerima kode?</span>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={cooldown > 0}
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