import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ArrowLeft, Home, LayoutDashboard, SearchX, TriangleAlert } from 'lucide-react'
import { useRef } from 'react'
import Button3D from '@/components/ui/button-3d'
import { Seo } from '@/components/seo/Seo'
import Sound1 from '@/components/shared/Sound1'
import Sound2 from '@/components/shared/Sound2'
import Sound3 from '@/components/shared/Sound3'
import Sound4 from '@/components/shared/Sound4'
import { useAuthSession } from '@/features/auth/context/AuthProvider'

type ErrorExperienceProps = {
  status: number
}

type ErrorCopy = {
  eyebrow: string
  title: string
  description: string
}

const ERROR_COPY: Record<number, ErrorCopy> = {
  403: {
    eyebrow: 'Akses dibatasi',
    title: 'Kamu belum bisa masuk ke area ini',
    description: 'Akun yang aktif tidak memiliki izin untuk membuka halaman ini. Kembali ke dashboard atau pilih halaman lain.',
  },
  404: {
    eyebrow: 'Sinyal halaman terputus',
    title: 'Halaman tidak ditemukan',
    description: 'Alamat yang kamu buka tidak tersedia, sudah dipindahkan, atau tidak lagi menjadi bagian dari alur ISAC 2026.',
  },
  419: {
    eyebrow: 'Sesi berakhir',
    title: 'Sesi halaman sudah kedaluwarsa',
    description: 'Muat ulang halaman atau masuk kembali agar sistem dapat melanjutkan permintaanmu dengan aman.',
  },
  429: {
    eyebrow: 'Tempo terlalu cepat',
    title: 'Terlalu banyak permintaan',
    description: 'Sistem sedang membatasi permintaan untuk menjaga layanan tetap stabil. Tunggu sebentar lalu coba kembali.',
  },
  500: {
    eyebrow: 'Gangguan sistem',
    title: 'Ada nada yang tidak sinkron',
    description: 'Sistem mengalami kesalahan yang tidak terduga. Data kamu tetap aman; silakan kembali atau coba lagi beberapa saat.',
  },
  503: {
    eyebrow: 'Jeda sementara',
    title: 'Layanan sedang dipersiapkan',
    description: 'ISAC 2026 sedang menjalani pemeliharaan singkat. Silakan kembali beberapa saat lagi.',
  },
}

const SOUND_NOTES = [
  { Component: Sound1, className: 'left-[4%] top-[16%] size-14 sm:size-20', depth: 22 },
  { Component: Sound2, className: 'right-[5%] top-[20%] size-16 sm:size-24', depth: 30 },
  { Component: Sound3, className: 'bottom-[14%] left-[7%] size-16 sm:size-24', depth: 36 },
  { Component: Sound4, className: 'bottom-[12%] right-[7%] size-14 sm:size-20', depth: 26 },
]

export function ErrorExperience({ status }: ErrorExperienceProps) {
  const rootRef = useRef<HTMLElement>(null)
  const { principal, isAuthenticated } = useAuthSession()
  const copy = ERROR_COPY[status] ?? ERROR_COPY[500]
  const dashboardHref =
    principal?.principalType === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  useGSAP(
    () => {
      if (!rootRef.current) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reducedMotion) {
        gsap.set(['.error-portal-card', '.error-digit', '.error-content > *', '.error-note'], {
          clearProps: 'all',
        })
        return
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .from('.error-portal-card', {
          autoAlpha: 0,
          y: 72,
          scale: 0.92,
          rotationX: 10,
          duration: 0.9,
        })
        .from(
          '.error-digit',
          {
            autoAlpha: 0,
            y: -70,
            rotationX: -100,
            stagger: 0.12,
            duration: 0.75,
          },
          '-=0.55',
        )
        .from(
          '.error-content > *',
          {
            autoAlpha: 0,
            y: 24,
            stagger: 0.1,
            duration: 0.55,
          },
          '-=0.45',
        )
        .from(
          '.error-note',
          {
            autoAlpha: 0,
            scale: 0.35,
            rotation: -24,
            stagger: 0.1,
            duration: 0.7,
          },
          '-=0.8',
        )

      const card = rootRef.current.querySelector<HTMLElement>('.error-portal-card')
      const notes = rootRef.current.querySelectorAll<HTMLElement>('.error-note')
      const handlePointerMove = (event: PointerEvent) => {
        const x = event.clientX / window.innerWidth - 0.5
        const y = event.clientY / window.innerHeight - 0.5

        if (card) {
          gsap.to(card, {
            rotationY: x * 4,
            rotationX: y * -3,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }

        notes.forEach((note) => {
          const depth = Number(note.dataset.depth ?? 20)
          gsap.to(note, {
            x: x * depth,
            y: y * depth,
            duration: 1,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        })
      }
      const resetPerspective = () => {
        if (card) {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.8,
            ease: 'power2.out',
          })
        }
      }

      window.addEventListener('pointermove', handlePointerMove)
      rootRef.current.addEventListener('pointerleave', resetPerspective)

      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        rootRef.current?.removeEventListener('pointerleave', resetPerspective)
      }
    },
    { scope: rootRef },
  )

  return (
    <>
      <Seo
        title={`${status} — ${copy.title}`}
        description={copy.description}
        canonical={typeof window === 'undefined' ? '/' : window.location.pathname}
        image='/logo.png'
        imageAlt='Logo ISAC 2026'
        noindex
        nofollow
      />

      <main
        ref={rootRef}
        className='error-portal-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-28 text-foreground sm:px-6'
      >
        <div aria-hidden='true' className='absolute inset-0 pointer-events-none'>
          <div className='absolute left-[12%] top-[12%] size-72 rounded-full bg-primary/10 blur-[120px]' />
          <div className='absolute bottom-[8%] right-[10%] size-80 rounded-full bg-secondary/10 blur-[130px]' />
          <div className='absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[180px]' />
        </div>

        {SOUND_NOTES.map(({ Component, className, depth }, index) => (
          <div
            key={index}
            aria-hidden='true'
            data-depth={depth}
            className={`error-note pointer-events-none absolute z-10 rounded-2xl border border-white/15 bg-card/25 p-3 backdrop-blur-md ${className}`}
          >
            <Component className='size-full drop-shadow-[0_0_14px_rgba(139,92,255,0.45)]' />
          </div>
        ))}

        <section className='error-portal-card relative z-20 w-full max-w-3xl [transform-style:preserve-3d]'>
          <span aria-hidden='true' className='error-border-portal' />
          <span aria-hidden='true' className='error-border-comet' />
          <span aria-hidden='true' className='error-border-pulse' />

          <div className='relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-card/45 px-6 py-9 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:px-10 sm:py-12'>
            <span aria-hidden='true' className='error-scanline' />

            <div className='grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12'>
              <div className='error-code-stage relative flex min-h-52 items-center justify-center' aria-label={`Error ${status}`}>
                <span aria-hidden='true' className='error-code-ring' />
                <span aria-hidden='true' className='error-code-echo error-code-echo-one'>{status}</span>
                <span aria-hidden='true' className='error-code-echo error-code-echo-two'>{status}</span>
                <div className='error-code-main' aria-hidden='true'>
                  {String(status).split('').map((digit, index) => (
                    <span key={index} className='error-digit inline-block'>{digit}</span>
                  ))}
                </div>
              </div>

              <div className='error-content space-y-6 text-center md:text-left'>
                <div className='inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary'>
                  {status === 404 ? <SearchX className='size-4' /> : <TriangleAlert className='size-4' />}
                  {copy.eyebrow}
                </div>

                <div className='space-y-3'>
                  <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>{copy.title}</h1>
                  <p className='text-sm leading-7 text-muted-foreground sm:text-base'>{copy.description}</p>
                </div>

                <div className='flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap md:justify-start'>
                  <Button3D href='/' variant='solid' className='w-full sm:w-auto'>
                    <span className='flex items-center gap-2'><Home className='size-4' />Beranda</span>
                  </Button3D>
                  {isAuthenticated && (
                    <Button3D href={dashboardHref} variant='ghost' className='w-full sm:w-auto'>
                      <span className='flex items-center gap-2'><LayoutDashboard className='size-4' />Dashboard</span>
                    </Button3D>
                  )}
                  <Button3D onClick={() => window.history.back()} variant='ghost' className='w-full sm:w-auto'>
                    <span className='flex items-center gap-2'><ArrowLeft className='size-4' />Kembali</span>
                  </Button3D>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
