import { Link, router, usePage } from '@inertiajs/react'
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { adminRoleLabels, navigation } from '@/constants/admin'


function SidebarContent({ minimized, mobile, closeMobile }: { minimized: boolean; mobile?: boolean; closeMobile?: () => void }) {
  const { url } = usePage()
  const { principal } = useAuthSession()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const logout = useLogout()
  const pathname = url.split('?')[0]
  const admin = principal?.principalType === 'ADMIN' ? principal.admin : null
  const items = admin ? navigation.filter((item) => item.roles.includes(admin.role)) : []

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => router.visit('/auth/login', { replace: true }),
    })
  }

  return (
    <>
      <div className={cn('flex h-full flex-col', minimized && !mobile ? 'px-3' : 'px-4')}>
        <div className={cn('flex h-20 items-center border-b border-sidebar-border', minimized && !mobile ? 'justify-center' : 'gap-3')}>
          <img src="/logo.png" alt="Logo ISAC 2026" className="size-11 shrink-0 object-contain" />
          {(!minimized || mobile) && (
            <div className="min-w-0">
              <p className="truncate font-semibold text-sidebar-foreground">ISAC 2026</p>
              <p className="text-xs text-sidebar-foreground/55">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-5" aria-label="Navigasi admin">
          {items.map((item) => {
            const active = item.href === '/admin/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={minimized && !mobile ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex min-h-11 items-center rounded-2xl border border-transparent text-sm font-medium transition-all',
                  minimized && !mobile ? 'justify-center px-2' : 'gap-3 px-3',
                  active
                    ? 'border-primary/25 bg-primary/15 text-white shadow-[0_0_20px_-12px_var(--primary)]'
                    : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className={cn('size-4.5 shrink-0', active && 'text-secondary')} />
                {(!minimized || mobile) && <span className="flex-1 truncate">{item.label}</span>}
                {item.comingSoon && (!minimized || mobile) && <Badge variant="outline" className="border-primary/25 text-[10px] text-primary">Segera</Badge>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border py-4">
          {(!minimized || mobile) && admin && (
            <div className="mb-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-3">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{admin.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/50">{adminRoleLabels[admin.role]}</p>
            </div>
          )}
          <Button variant="ghost" className={cn('w-full text-destructive hover:bg-destructive/10 hover:text-destructive', minimized && !mobile ? 'px-0' : 'justify-start')} onClick={() => setLogoutOpen(true)} title={minimized && !mobile ? 'Keluar' : undefined}>
            <LogOut className="size-4" />
            {(!minimized || mobile) && 'Keluar'}
          </Button>
        </div>
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari Admin Panel?</DialogTitle>
            <DialogDescription>Token sesi aktif akan dihapus dari perangkat ini.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleLogout} disabled={logout.isPending}>{logout.isPending ? 'Memproses...' : 'Keluar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { url } = usePage()
  const { principal } = useAuthSession()
  const [minimized, setMinimized] = useState(() => window.localStorage.getItem('isac-admin-sidebar') === 'minimized')
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = url.split('?')[0]
  const currentItem = navigation.find((item) => item.href === '/admin/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
  const admin = principal?.principalType === 'ADMIN' ? principal.admin : null

  useEffect(() => {
    window.localStorage.setItem('isac-admin-sidebar', minimized ? 'minimized' : 'expanded')
  }, [minimized])

  return (
    <div className="min-h-screen bg-background/70 text-foreground">
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-[width] duration-300 lg:block', minimized ? 'w-20' : 'w-68')}>
        <SidebarContent minimized={minimized} />
        <Button variant="outline" size="icon-sm" className="absolute -right-4 top-24 rounded-full border-sidebar-border bg-sidebar shadow-lg" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? 'Perbesar sidebar' : 'Perkecil sidebar'}>
          {minimized ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-[min(88vw,320px)] border-sidebar-border bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi Admin</SheetTitle>
            <SheetDescription>Menu operasional ISAC 2026.</SheetDescription>
          </SheetHeader>
          <SidebarContent minimized={false} mobile closeMobile={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn('min-h-screen transition-[padding] duration-300', minimized ? 'lg:pl-20' : 'lg:pl-68')}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka navigasi admin"><Menu /></Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Admin / {currentItem?.label ?? 'Detail'}</p>
              <p className="truncate font-semibold">{currentItem?.label ?? 'Detail Tim'}</p>
            </div>
            {admin && (
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 sm:flex">
                <ShieldCheck className="size-4 text-secondary" />
                <span className="max-w-40 truncate text-xs">{admin.name}</span>
              </div>
            )}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

export function adminPageLayout(page: ReactNode) {
  return <AdminShell>{page}</AdminShell>
}
