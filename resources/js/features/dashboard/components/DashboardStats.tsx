import { CheckCircle2, CircleDot, ListChecks } from 'lucide-react';
import { DashboardSummaryCard } from './DashboardSummaryCard';
import type { DashboardSummary } from '../types/dashboardTypes';

type DashboardStatsProps = {
    summary?: DashboardSummary;
};

export function DashboardStats({ summary }: DashboardStatsProps) {
    return (
        <section className="grid gap-4 md:grid-cols-3">
            <DashboardSummaryCard
                label="Total Todos"
                value={summary?.total ?? 0}
                description="Semua item yang tercatat."
                icon={<ListChecks className="size-5" />}
                tone="sky"
            />
            <DashboardSummaryCard
                label="Active"
                value={summary?.active ?? 0}
                description="Masih perlu ditindaklanjuti."
                icon={<CircleDot className="size-5" />}
                tone="amber"
            />
            <DashboardSummaryCard
                label="Done"
                value={summary?.completed ?? 0}
                description="Sudah selesai dikerjakan."
                icon={<CheckCircle2 className="size-5" />}
                tone="emerald"
            />
        </section>
    );
}
