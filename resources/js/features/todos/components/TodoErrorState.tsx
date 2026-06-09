type TodoErrorStateProps = {
    message?: string;
};

export function TodoErrorState({ message }: TodoErrorStateProps) {
    return (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
            Gagal mengambil data: {message || 'Unknown error'}
        </div>
    );
}
