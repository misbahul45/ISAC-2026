import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginInput } from '../schemas';

export function LoginForm() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    function handleSubmit(data: LoginInput) {
        console.log(data);
        setSuccessMessage('Login form submitted locally.');
    }

    return (
        <Card className="w-full rounded-lg">
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Masukkan email dan password akun.</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Email
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id={field.name}
                                        type="email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="name@example.com"
                                        autoComplete="email"
                                    />

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
                                    <FieldLabel htmlFor={field.name}>
                                        Password
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id={field.name}
                                        type="password"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Masukkan password"
                                        autoComplete="current-password"
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {successMessage && (
                            <p className="text-sm text-emerald-600" role="status">
                                {successMessage}
                            </p>
                        )}

                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
