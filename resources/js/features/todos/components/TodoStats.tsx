import type { TodoStats as TodoStatsType } from '../types/todoTypes';

type TodoStatsProps = {
    stats: TodoStatsType;
};

export function TodoStats({ stats }: TodoStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-3">
            <div className="rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-slate-400">Total</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-slate-400">Active</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-slate-400">Done</p>
            </div>
        </div>
    );
}
