import { router } from '@inertiajs/react'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/features/auth/context/AuthProvider'

export default function AdminDashboard() {
  const { principal, isAuthenticated, isLoading } = useAuthSession()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) router.visit('/auth/login')
    else if (principal?.principalType !== 'ADMIN') router.visit('/dashboard')
  }, [isAuthenticated, isLoading, principal])

  return (
    <main className="relative z-10 min-h-screen px-4 pb-16 pt-28 text-primary-foreground">
      <Seo title="Admin Dashboard" description="Dashboard operasional ISAC 2026." canonical="/admin/dashboard" noindex />
      <Card className="mx-auto max-w-4xl border-border/50 bg-background/70 backdrop-blur-md">
        <CardHeader><CardTitle>Admin Dashboard</CardTitle></CardHeader>
        <CardContent>
          <p>{principal?.principalType === 'ADMIN' ? `${principal.admin.name} · ${principal.admin.role}` : 'Memuat session admin...'}</p>
          <p className="mt-3 text-sm text-muted-foreground">API verifikasi Team, pembayaran, dan perpindahan stage siap digunakan sesuai role admin.</p>
        </CardContent>
      </Card>
    </main>
  )
}
