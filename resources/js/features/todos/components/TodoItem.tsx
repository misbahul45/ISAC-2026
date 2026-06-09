import type { Todo } from '../types/todoTypes';

type TodoItemProps = {
    todo: Todo;
    isToggling: boolean;
    isDeleting: boolean;
    onToggle: (todo: Todo) => void;
    onDelete: (id: number) => void;
};

export function TodoItem({
    todo,
    isToggling,
    isDeleting,
    onToggle,
    onDelete,
}: TodoItemProps) {
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 md:flex-row md:items-center md:justify-between">
            <button
                type="button"
                onClick={() => onToggle(todo)}
                disabled={isToggling}
                className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-60"
            >
                <span
                    className={[
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs',
                        todo.is_completed
                            ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                            : 'border-slate-500 bg-transparent text-transparent',
                    ].join(' ')}
                >
                    ✓
                </span>

                <span
                    className={[
                        'truncate text-sm font-semibold md:text-base',
                        todo.is_completed
                            ? 'text-slate-500 line-through'
                            : 'text-white',
                    ].join(' ')}
                >
                    {todo.title}
                </span>
            </button>

            <button
                type="button"
                onClick={() => onDelete(todo.id)}
                disabled={isDeleting}
                className="rounded-xl border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
                Hapus
            </button>
        </div>
    );
}
