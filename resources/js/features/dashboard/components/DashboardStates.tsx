import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardBackdrop } from './DashboardBackdrop'

export function DashboardLoading() {
  return (
    <main className="error-portal-shell relative min-h-screen overflow-hidden px-4 pb-20 pt-28 sm:px-6">
      <DashboardBackdrop />
      <div className="relative z-20 mx-auto max-w-6xl space-y-6" role="status" aria-label="Memuat dashboard Team">
        <Skeleton className="h-72 w-full rounded-[2rem] bg-card/60" />
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-52 rounded-[2rem] bg-card/60" />
          <Skeleton className="h-52 rounded-[2rem] bg-card/60" />
        </div>
      </div>
    </main>
  )
}

export function DashboardError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <main className="error-portal-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-28">
      <DashboardBackdrop />
      <section className="error-portal-card relative z-20 w-full max-w-xl">
        <span aria-hidden="true" className="error-border-portal" />
        <span aria-hidden="true" className="error-border-comet" />
        <div className="relative z-10 rounded-[2rem] border border-white/10 bg-card/55 p-8 text-center shadow-2xl backdrop-blur-2xl">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Dashboard belum dapat dimuat</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
          <Button className="mt-6" onClick={retry}><RefreshCw />Coba Lagi</Button>
        </div>
      </section>
    </main>
  )
}
