import { Seo } from '@/components/seo/Seo';
import { TodoCreateForm } from '@/features/todos/components/TodoCreateForm';
import { TodoHero } from '@/features/todos/components/TodoHero';
import { TodoList } from '@/features/todos/components/TodoList';
import { useTodos } from '@/features/todos/hooks/useTodos';

type TodosIndexProps = {
    title?: string;
};

export default function TodosIndex({ title }: TodosIndexProps) {
    const {
        todos,
        stats,
        todosQuery,
        createTodoMutation,
        toggleTodoMutation,
        deleteTodoMutation,
    } = useTodos();

    return (
        <>
            <Seo
                title={title || 'Todo List'}
                description="Kelola daftar tugas ISAC 2026 dengan tampilan React Inertia dan Laravel."
                canonical="/todos"
                type="website"
                noindex
            />

            <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-5xl space-y-8">
                    <TodoHero stats={stats} />

                    <TodoCreateForm
                        isSubmitting={createTodoMutation.isPending}
                        errorMessage={createTodoMutation.error?.message}
                        onCreate={(payload) => createTodoMutation.mutate(payload)}
                    />

                    <TodoList
                        todos={todos}
                        isLoading={todosQuery.isLoading}
                        isError={todosQuery.isError}
                        errorMessage={todosQuery.error?.message}
                        isFetching={todosQuery.isFetching}
                        isToggling={toggleTodoMutation.isPending}
                        isDeleting={deleteTodoMutation.isPending}
                        onToggle={(todo) => toggleTodoMutation.mutate(todo)}
                        onDelete={(id) => deleteTodoMutation.mutate(id)}
                    />
                </div>
            </main>
        </>
    );
}
