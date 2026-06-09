export function TodoEmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 p-10 text-center">
            <p className="text-lg font-semibold">Belum ada todo.</p>
            <p className="mt-2 text-sm text-slate-400">
                Tambahkan todo pertama kamu dari form di atas.
            </p>
        </div>
    );
}
