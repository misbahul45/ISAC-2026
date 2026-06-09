import { FormEvent, useState } from 'react';
import { validateCreateTodoInput } from '../schemas/todoSchema';
import type { CreateTodoPayload } from '../types/todoTypes';

type TodoCreateFormProps = {
    isSubmitting: boolean;
    errorMessage?: string;
    onCreate: (payload: CreateTodoPayload) => void;
};

export function TodoCreateForm({
    isSubmitting,
    errorMessage,
    onCreate,
}: TodoCreateFormProps) {
    const [title, setTitle] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const result = validateCreateTodoInput({ title });

        if (!result.valid) {
            setValidationError(result.error);
            return;
        }

        console.log('FORM VALID PAYLOAD:', result.data);

        setValidationError(null);
        onCreate(result.data);
        setTitle('');
    }

    return (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
                <input
                    type="text"
                    value={title}
                    onChange={(event) => {
                        setTitle(event.target.value);
                        setValidationError(null);
                    }}
                    placeholder="Tulis todo baru..."
                    className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                />

                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="min-h-12 rounded-2xl bg-blue-500 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? 'Menyimpan...' : 'Tambah Todo'}
                </button>
            </form>

            {validationError && (
                <p className="mt-3 text-sm text-yellow-300">
                    {validationError}
                </p>
            )}

            {errorMessage && (
                <p className="mt-3 text-sm text-red-300">
                    Gagal menambah todo: {errorMessage}
                </p>
            )}
        </section>
    );
}
