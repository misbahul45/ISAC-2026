import { Header_Nav, IMAGES } from '@/constants/general'
import { Image } from '@unpic/react'
import { Link, usePage } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, LogOut, Menu, User, X } from 'lucide-react'
import Button3D from '@/components/ui/button-3d'
import { useAuthSession } from '@/features/auth/context/AuthProvider'
import { useLogout } from '@/features/auth/hooks/useAuth'

interface HeaderPageProps { errorPage?: boolean; [key: string]: unknown }
interface NavItem { id: number; label: string; href: string }
interface NavLinkProps { nav: NavItem; isActive: boolean; onNavigate?: () => void; mobile?: boolean }

const NavLink = ({ nav, isActive, onNavigate, mobile = false }: NavLinkProps) => {
  const baseClass = mobile
    ? 'nav-link inline-block py-2 px-4 rounded-lg text-base font-medium transition-all'
    : 'nav-link px-4 py-1.5 rounded-lg text-base font-medium transition-all'
  const stateClass = isActive
    ? 'bg-primary/60 text-white shadow-[0_0_12px_-2px_var(--primary)]'
    : 'text-white hover:text-primary hover:bg-white/5'

  return <li><a href={nav.href} onClick={onNavigate} className={`${baseClass} ${stateClass}`}>{nav.label}</a></li>
}

const Header = () => {
  const { url, props } = usePage<HeaderPageProps>()
  const { principal, isAuthenticated } = useAuthSession()
  const logoutMutation = useLogout()
  const pathname = url.split('?')[0]
  const isLanding = pathname === '/'
  const isAuthPage = pathname.startsWith('/auth')
  const isRegistrationPage = pathname === '/registration' || pathname.startsWith('/registration/')
  const isUserDashboard = pathname === '/dashboard'
  const isMinimalPage = isAuthPage || props.errorPage === true
  const dashboardHref = principal?.principalType === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(Header_Nav[0].href)
  const [isVisible, setIsVisible] = useState(true)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const AUTO_HIDE_DELAY = 3000

  const handleLogout = async () => {
    await logoutMutation.mutateAsync().catch(() => undefined)
    window.location.href = '/'
  }
  const startHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (!isMobileOpen && window.scrollY > 20) setIsVisible(false)
    }, AUTO_HIDE_DELAY)
  }
  const clearHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  useEffect(() => {
    if (!isLanding) return
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20)
      setIsVisible(true)
      startHideTimer()
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearHideTimer()
    }
  }, [isLanding])

  useEffect(() => {
    if (isMobileOpen) {
      setIsVisible(true)
      clearHideTimer()
    } else if (isLanding) startHideTimer()
  }, [isMobileOpen, isLanding])

  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setIsMobileOpen(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isLanding) return
    const sections = Header_Nav.filter((nav) => nav.href.startsWith('#'))
      .map((nav) => document.querySelector(nav.href))
      .filter((element): element is Element => Boolean(element))
    if (sections.length === 0) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`)
      })
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [isLanding])

  const handleMouseEnter = () => {
    if (!isLanding) return
    setIsVisible(true)
    clearHideTimer()
  }
  const handleMouseLeave = () => {
    if (isLanding && !isMobileOpen && window.scrollY > 20) startHideTimer()
  }
  const navItems = Header_Nav.map((nav) => ({ ...nav, href: isLanding ? nav.href : `/${nav.href}` }))

  if (isRegistrationPage || isUserDashboard) return null

  if (isMinimalPage) {
    return (
      <header className='fixed z-50 top-0 left-0 w-full max-w-7xl'>
        <div className='max-w-7xl mx-auto px-4 md:px-6 py-3'>
          <div className='flex items-center justify-between'>
            <Link href='/' className='flex items-center gap-2 p-2 bg-background/10 backdrop-blur-md rounded-full px-4 border-2 border-white/20 text-white hover:text-primary transition-colors'>
              <ArrowLeft className='w-5 h-5' /><span className='text-base font-medium'>Back</span>
            </Link>
            <Link href='/' aria-label='Kembali ke beranda ISAC 2026'>
              <Image src={IMAGES.logo} alt='Logo ISAC 2026' height={45} width={126} className='h-auto w-24 md:w-[126px]' />
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={'fixed z-50 left-1/2 -translate-x-1/2 w-full max-w-7xl transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform ' + (isVisible ? 'top-0' : '-top-24') + ' ' + (isScrolled ? 'md:scale-x-[0.9] scale-x-[0.94]' : 'scale-x-100')}>
      <div className={'relative isolate overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ' + (isScrolled ? 'rounded-2xl header-glow' : 'rounded-none')}>
        {isScrolled && <><span aria-hidden='true' className='header-border-track' /><span aria-hidden='true' className='header-border-spin' /></>}
        <div className={'relative z-10 transition-colors duration-700 ' + (isScrolled || isMobileOpen ? 'rounded-[inherit] bg-card/40 backdrop-blur-md' : 'rounded-[inherit] bg-transparent')}>
          <div className='max-w-7xl mx-auto'>
            <div className='flex items-center justify-between px-4 md:px-6 py-3'>
              <Link href='/' aria-label='Beranda ISAC 2026'>
                <Image src={IMAGES.logo} alt='Logo ISAC 2026' height={45} width={126} className='h-auto w-24 md:w-[126px]' />
              </Link>
              <aside className='hidden md:block'>
                <ul className='flex items-center gap-2 lg:gap-3'>
                  {navItems.map((nav) => <NavLink key={nav.id} nav={nav} isActive={activeSection === nav.href} />)}
                </ul>
              </aside>
              <div className='hidden md:flex items-center gap-3'>
                {isAuthenticated ? <>
                  <Link href={dashboardHref} aria-label='Dashboard' className='flex size-9 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-colors hover:border-primary/60 hover:text-primary hover:shadow-[0_0_12px_-2px_var(--primary)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30'><User className='size-4' /></Link>
                  <button type='button' onClick={handleLogout} disabled={logoutMutation.isPending} aria-label='Logout' className='flex size-9 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-colors hover:border-primary/60 hover:text-primary'><LogOut className='size-4' /></button>
                </> : <><Button3D variant='ghost' href='/auth/login'>Login</Button3D><Button3D variant='solid' href='/auth/register'>Register</Button3D></>}
              </div>
              <button className='md:hidden p-2 text-white' onClick={() => setIsMobileOpen((prev) => !prev)} aria-label='Toggle menu'>
                {isMobileOpen ? <X className='w-6 h-6 text-white' /> : <Menu className='w-6 h-6 text-white' />}
              </button>
            </div>
            <div className={'md:hidden overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ' + (isMobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')}>
              <ul className='flex flex-col gap-1 px-4 pb-2'>
                {navItems.map((nav) => <NavLink key={nav.id} nav={nav} isActive={activeSection === nav.href} onNavigate={() => setIsMobileOpen(false)} mobile />)}
              </ul>
              <div className='flex gap-3 px-4 pb-4'>
                {isAuthenticated ? <>
                  <Link href={dashboardHref} className='flex flex-1 items-center justify-center gap-2 rounded-4xl border border-border bg-card/80 py-2 text-sm font-medium text-foreground'><User className='size-4' />Dashboard</Link>
                  <button type='button' onClick={handleLogout} disabled={logoutMutation.isPending} className='flex flex-1 items-center justify-center gap-2 rounded-4xl border border-border bg-card/80 py-2 text-sm font-medium text-foreground'><LogOut className='size-4' />Logout</button>
                </> : <><Button3D variant='ghost' className='flex-1' href='/auth/login'>Login</Button3D><Button3D variant='solid' className='flex-1' href='/auth/register'>Register</Button3D></>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
