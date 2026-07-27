import { Link } from '@inertiajs/react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { IMAGES } from '@/constants/general'
import { FloatingIcons } from '@/components/shared/FloatingIcons'
import { AUTH_PAGE_CONFIGS } from '@/constants/auth'

const CUBES = [
  { className: 'left-[10%] top-[22%] size-12', delay: '0s',   duration: '6s' },
  { className: 'right-[12%] top-[28%] size-8', delay: '1.2s', duration: '7s' },
  { className: 'left-[18%] bottom-[24%] size-10', delay: '0.6s', duration: '5.5s' },
  { className: 'right-[20%] bottom-[26%] size-14', delay: '1.8s', duration: '8s' },
]

export function Hero() {
  return (
    <section id="home" className="relative flex md:min-h-screen pt-28 flex-col items-center justify-center overflow-hidden px-12 text-center">
        <div className="pointer-events-none absolute inset-0 z-0">
            <img
                src={IMAGES.bgHero}
                alt=""
                aria-hidden="true"
                className="absolute opacity-50 inset-0 h-full w-full object-cover"
            />
            <FloatingIcons config={AUTH_PAGE_CONFIGS['/auth/login']} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
            <p className="mb-6 text-3xl font-medium tracking-wide text-shadow-[0_0_8px_#fff]">
            Ready to Begin?
            </p>

            <img src={IMAGES.logo} alt="Logo ISAC 2026" className="mb-8 w-56 md:w-72" />

            <p className="max-w-2xl text-sm leading-relaxed md:text-base">
            <span className="font-bold">Information Systems Airlangga Competition (ISAC)</span> merupakan ajang kompetisi
            tahunan berskala nasional yang diselenggarakan oleh Himpunan Mahasiswa S1
            Sistem Informasi (HIMSI) Universitas Airlangga. ISAC hadir sebagai wadah
            strategis bagi generasi muda untuk memperkreasikan inovasi dan mengasah
            kapabilitas di sektor Bisnis dan Teknologi Informasi.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link href={ROUTES.login} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
                    Sign in
                </Link>
                <Link href={ROUTES.register} className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}>
                    Register now
                </Link>
            </div>
        </div>
    </section>
  )
}
