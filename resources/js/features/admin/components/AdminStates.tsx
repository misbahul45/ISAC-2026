import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AdminLoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return <Card className="border-border/60 bg-card/70"><CardContent className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="size-5 animate-spin text-primary" />{label}</CardContent></Card>
}

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return <Card className="border-dashed border-border bg-card/50"><CardContent className="flex min-h-48 flex-col items-center justify-center gap-2 text-center"><Inbox className="size-9 text-primary/70" /><p className="font-medium">{title}</p><p className="max-w-lg text-sm text-muted-foreground">{description}</p></CardContent></Card>
}

export function AdminErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <Card className="border-destructive/30 bg-destructive/5"><CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><AlertTriangle className="size-9 text-destructive" /><p className="font-medium">Data tidak dapat dimuat</p><p className="text-sm text-muted-foreground">{message}</p>{retry && <Button variant="outline" onClick={retry}><RefreshCw />Coba lagi</Button>}</CardContent></Card>
}

