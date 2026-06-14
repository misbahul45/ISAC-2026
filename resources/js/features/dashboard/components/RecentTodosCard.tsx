import { Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';

export function RecentTodosCard() {
    return (
        <Card className="rounded-lg bg-white shadow-sm">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle>Recent Todos</CardTitle>
                        <CardDescription>
                            Akses cepat ke daftar todo dan status kerja terbaru.
                        </CardDescription>
                    </div>
                    <div className="rounded-lg bg-sky-50 p-2 text-sky-700">
                        <ClipboardList className="size-5" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
                    <p className="font-medium text-slate-950">Daftar todo tersedia di halaman Todos.</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Dashboard menjaga ringkasan tetap ringan. Gunakan halaman Todos untuk
                        melihat, membuat, memperbarui, atau menghapus item.
                    </p>
                </div>

                <Separator />

                <Link
                    href={ROUTES.todos}
                    className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                    Kelola todos
                    <ArrowRight className="size-4" />
                </Link>
            </CardContent>
        </Card>
    );
}
