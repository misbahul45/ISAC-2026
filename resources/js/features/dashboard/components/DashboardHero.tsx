import { Link } from '@inertiajs/react';
import { CalendarDays, CheckSquare, ListTodo } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

export function DashboardHero() {
    return (
        <Card className="rounded-lg border-white/10 bg-white text-slate-950 shadow-sm">
            <CardContent className="p-6">
                <section className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                            <CalendarDays className="size-3.5" />
                            ISAC 2026 Operations
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                                Dashboard
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                Pantau ringkasan todo, progres penyelesaian, dan prioritas kerja
                                dari satu tampilan operasional.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link
                            href={ROUTES.todos}
                            className={buttonVariants({
                                className: 'rounded-lg',
                            })}
                        >
                            <ListTodo className="size-4" />
                            Buka Todos
                        </Link>

                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            <CheckSquare className="size-4 text-emerald-600" />
                            Data dashboard aktif
                        </div>
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}
