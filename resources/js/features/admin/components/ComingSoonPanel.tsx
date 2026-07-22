import { Construction, LockKeyhole } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ComingSoonPanel({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-card/70 backdrop-blur-md">
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 rounded-3xl border border-primary/25 bg-primary/10 p-4 text-primary"><Construction className="size-10" /></div>
        <Badge variant="outline" className="mb-3 border-primary/30 text-primary">Segera hadir</Badge>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-background/50 px-4 py-3 text-xs text-muted-foreground"><LockKeyhole className="size-4 text-secondary" />Menunggu endpoint read-only: <code className="text-foreground">{endpoint}</code></div>
      </CardContent>
    </Card>
  )
}
