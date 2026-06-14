import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type DashboardSummaryCardProps = {
    label: string;
    value: number;
    description: string;
    icon: ReactNode;
    tone: 'sky' | 'amber' | 'emerald';
};

const toneClassName = {
    sky: 'bg-sky-50 text-sky-700 ring-sky-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
} as const;

export function DashboardSummaryCard({
    label,
    value,
    description,
    icon,
    tone,
}: DashboardSummaryCardProps) {
    return (
        <Card className="rounded-lg bg-white shadow-sm">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">
                        {value}
                    </p>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>

                <div className={`rounded-lg p-2 ring-1 ${toneClassName[tone]}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}
