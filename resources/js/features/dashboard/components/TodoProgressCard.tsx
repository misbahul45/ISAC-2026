import { TrendingUp } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { DashboardSummary } from '../types/dashboardTypes';

type TodoProgressCardProps = {
    summary?: DashboardSummary;
};

export function TodoProgressCard({ summary }: TodoProgressCardProps) {
    const total = summary?.total ?? 0;
    const completed = summary?.completed ?? 0;
    const active = summary?.active ?? 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Card className="rounded-lg bg-white shadow-sm">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle>Todo Progress</CardTitle>
                        <CardDescription>
                            Rasio todo selesai dibanding total todo.
                        </CardDescription>
                    </div>
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                        <TrendingUp className="size-5" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-4xl font-semibold tracking-tight text-slate-950">
                            {progress}%
                        </p>
                        <p className="text-sm text-slate-500">Completion rate</p>
                    </div>
                    <p className="text-sm text-slate-500">
                        {completed} dari {total} selesai
                    </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium text-slate-950">{active}</p>
                        <p className="text-slate-500">Active</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium text-slate-950">{completed}</p>
                        <p className="text-slate-500">Completed</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
