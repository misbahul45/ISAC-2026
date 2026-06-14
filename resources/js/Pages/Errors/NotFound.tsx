import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

export default function NotFound() {
    return (
        <>
            <Head title="404" />

            <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
                <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
                    <Card className="w-full rounded-lg bg-white text-slate-950 shadow-sm">
                        <CardContent className="grid gap-8 p-8 md:grid-cols-[auto_1fr] md:items-center">
                            <div className="flex size-20 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                                <SearchX className="size-10" />
                            </div>

                            <section className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                                        404
                                    </p>
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                            Halaman tidak ditemukan
                                        </h1>
                                        <p className="max-w-xl text-sm leading-6 text-slate-600">
                                            URL yang kamu buka tidak tersedia, sudah dipindahkan,
                                            atau tidak termasuk route aplikasi ISAC 2026.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={ROUTES.dashboard}
                                        className={buttonVariants({
                                            className: 'rounded-lg',
                                        })}
                                    >
                                        <Home className="size-4" />
                                        Ke Dashboard
                                    </Link>

                                    <Link
                                        href={ROUTES.todos}
                                        className={buttonVariants({
                                            variant: 'outline',
                                            className: 'rounded-lg',
                                        })}
                                    >
                                        <ArrowLeft className="size-4" />
                                        Buka Todos
                                    </Link>
                                </div>
                            </section>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}
