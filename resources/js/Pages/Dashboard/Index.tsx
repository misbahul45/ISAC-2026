import { AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Seo } from '@/components/seo/Seo';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { DashboardHero } from '@/features/dashboard/components/DashboardHero';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { RecentTodosCard } from '@/features/dashboard/components/RecentTodosCard';
import { TodoProgressCard } from '@/features/dashboard/components/TodoProgressCard';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import type { InertiaPageProps } from '@/types/inertia';

export default function DashboardIndex({ title = 'Dashboard' }: InertiaPageProps) {
    const { summary, summaryQuery } = useDashboard();

    return (
        <DashboardLayout>
            <Seo
                title={title}
                description="Ringkasan aktivitas dan data utama sistem ISAC 2026."
                canonical="/dashboard"
                noindex
            />
            <DashboardHero />

            {summaryQuery.isLoading && (
                <div className="grid gap-4 md:grid-cols-3" role="status">
                    <Skeleton className="h-36 rounded-lg bg-white/10" />
                    <Skeleton className="h-36 rounded-lg bg-white/10" />
                    <Skeleton className="h-36 rounded-lg bg-white/10" />
                    <span className="sr-only">Loading dashboard data</span>
                </div>
            )}

            {summaryQuery.isFetching && !summaryQuery.isLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Spinner className="size-4" />
                    Memperbarui data dashboard
                </div>
            )}

            {summaryQuery.isError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-100">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>{summaryQuery.error.message}</p>
                </div>
            )}

            {!summaryQuery.isLoading && (
                <>
                    <DashboardStats summary={summary} />

                    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <TodoProgressCard summary={summary} />
                        <RecentTodosCard />
                    </section>
                </>
            )}
        </DashboardLayout>
    );
}
