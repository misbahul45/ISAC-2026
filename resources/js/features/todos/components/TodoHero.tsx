import { TodoStats } from './TodoStats';
import type { TodoStats as TodoStatsType } from '../types/todoTypes';

type TodoHeroProps = {
    stats: TodoStatsType;
};

export function TodoHero({ stats }: TodoHeroProps) {
    return (
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-blue-950/40">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                        ISAC-2026 Todo System
                    </p>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
                        Todo List
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                        React TypeScript UI yang connect ke Laravel API, disimpan ke MySQL,
                        dan dikelola dengan TanStack Query.
                    </p>
                </div>

                <TodoStats stats={stats} />
            </div>
        </section>
    );
}
