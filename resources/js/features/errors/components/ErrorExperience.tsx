import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import {
  ArrowLeft,
  Home,
  LayoutDashboard,
  TriangleAlert,
} from 'lucide-react'
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

type BackgroundSquare = {
  className: string
  innerClassName: string
}

const ERROR_COPY: Record<number, ErrorCopy> = {
  403: {
    eyebrow: 'Akses dibatasi',
    title: 'Kamu belum bisa masuk ke area ini',
    description:
      'Akun yang aktif tidak memiliki izin untuk membuka halaman ini. Kembali ke dashboard atau pilih halaman lain.',
  },
  404: {
    eyebrow: 'Sinyal halaman terputus',
    title: 'Halaman tidak ditemukan',
    description:
      'Alamat yang kamu buka tidak tersedia, sudah dipindahkan, atau tidak lagi menjadi bagian dari alur ISAC 2026.',
  },
  419: {
    eyebrow: 'Sesi berakhir',
    title: 'Sesi halaman sudah kedaluwarsa',
    description:
      'Muat ulang halaman atau masuk kembali agar sistem dapat melanjutkan permintaanmu dengan aman.',
  },
  429: {
    eyebrow: 'Tempo terlalu cepat',
    title: 'Terlalu banyak permintaan',
    description:
      'Sistem sedang membatasi permintaan untuk menjaga layanan tetap stabil. Tunggu sebentar lalu coba kembali.',
  },
  500: {
    eyebrow: 'Gangguan sistem',
    title: 'Ada nada yang tidak sinkron',
    description:
      'Sistem mengalami kesalahan yang tidak terduga. Data kamu tetap aman; silakan kembali atau coba lagi beberapa saat.',
  },
  503: {
    eyebrow: 'Jeda sementara',
    title: 'Layanan sedang dipersiapkan',
    description:
      'ISAC 2026 sedang menjalani pemeliharaan singkat. Silakan kembali beberapa saat lagi.',
  },
}

const SOUND_NOTES = [
  {
    Component: Sound1,
    className:
      'left-[2%] top-[12%] size-11 sm:left-[4%] sm:top-[16%] sm:size-20',
    depth: 22,
  },
  {
    Component: Sound2,
    className:
      'right-[2%] top-[14%] size-12 sm:right-[5%] sm:top-[20%] sm:size-24',
    depth: 30,
  },
  {
    Component: Sound3,
    className:
      'bottom-[8%] left-[3%] size-12 sm:bottom-[14%] sm:left-[7%] sm:size-24',
    depth: 36,
  },
  {
    Component: Sound4,
    className:
      'bottom-[7%] right-[3%] size-11 sm:bottom-[12%] sm:right-[7%] sm:size-20',
    depth: 26,
  },
]

const BACKGROUND_SQUARES: BackgroundSquare[] = [
  {
    className:
      'left-[5%] top-[9%] size-12 rotate-12 sm:size-20 lg:size-28',
    innerClassName: 'inset-[24%]',
  },
  {
    className:
      'right-[7%] top-[8%] size-10 -rotate-12 sm:size-16 lg:size-24',
    innerClassName: 'inset-[28%]',
  },
  {
    className:
      'left-[13%] top-[43%] size-8 rotate-45 sm:size-14 lg:size-20',
    innerClassName: 'inset-[24%]',
  },
  {
    className:
      'right-[12%] top-[48%] size-14 rotate-[18deg] sm:size-20 lg:size-32',
    innerClassName: 'inset-[30%]',
  },
  {
    className:
      'bottom-[5%] left-[22%] size-10 -rotate-[20deg] sm:size-16 lg:size-24',
    innerClassName: 'inset-[24%]',
  },
  {
    className:
      'bottom-[7%] right-[22%] size-8 rotate-[35deg] sm:size-14 lg:size-20',
    innerClassName: 'inset-[28%]',
  },
  {
    className:
      'left-[45%] top-[5%] hidden size-14 rotate-45 sm:block lg:size-20',
    innerClassName: 'inset-[30%]',
  },
  {
    className:
      'bottom-[3%] left-[48%] hidden size-12 -rotate-12 sm:block lg:size-16',
    innerClassName: 'inset-[25%]',
  },
]

export function ErrorExperience({
  status,
}: ErrorExperienceProps) {
  const rootRef = useRef<HTMLElement>(null)
  const { principal, isAuthenticated } = useAuthSession()
  const copy = ERROR_COPY[status] ?? ERROR_COPY[500]

  const dashboardHref =
    principal?.principalType === 'ADMIN'
      ? '/admin/dashboard'
      : '/dashboard'

  useGSAP(
    () => {
      if (!rootRef.current) return

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (reducedMotion) {
        gsap.set(
          [
            '.error-portal-card',
            '.error-digit',
            '.error-content > *',
            '.error-note',
            '.error-square',
            '.error-status-badge',
          ],
          {
            clearProps: 'all',
          },
        )

        return
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      })

      timeline
        .from('.error-portal-card', {
          autoAlpha: 0,
          y: 72,
          scale: 0.92,
          rotationX: 10,
          duration: 0.9,
        })
        .from(
          '.error-status-badge',
          {
            autoAlpha: 0,
            x: 35,
            scale: 0.8,
            duration: 0.55,
          },
          '-=0.65',
        )
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
        .from(
          '.error-square',
          {
            autoAlpha: 0,
            scale: 0.4,
            rotation: -40,
            stagger: 0.05,
            duration: 0.65,
          },
          '-=0.9',
        )

      gsap.to('.error-square', {
        y: -12,
        rotation: '+=8',
        duration: 5,
        stagger: {
          each: 0.4,
          from: 'random',
        },
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      const card =
        rootRef.current.querySelector<HTMLElement>(
          '.error-portal-card',
        )

      const notes =
        rootRef.current.querySelectorAll<HTMLElement>(
          '.error-note',
        )

      const squares =
        rootRef.current.querySelectorAll<HTMLElement>(
          '.error-square',
        )

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

        squares.forEach((square, index) => {
          const depth = 6 + (index % 4) * 4

          gsap.to(square, {
            x: x * depth,
            y: y * depth,
            duration: 1.2,
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

      window.addEventListener(
        'pointermove',
        handlePointerMove,
      )

      rootRef.current.addEventListener(
        'pointerleave',
        resetPerspective,
      )

      return () => {
        window.removeEventListener(
          'pointermove',
          handlePointerMove,
        )

        rootRef.current?.removeEventListener(
          'pointerleave',
          resetPerspective,
        )
      }
    },
    {
      scope: rootRef,
    },
  )

  return (
    <>
      <Seo
        title={`${status} — ${copy.title}`}
        description={copy.description}
        canonical={
          typeof window === 'undefined'
            ? '/'
            : window.location.pathname
        }
        image="/logo.png"
        imageAlt="Logo ISAC 2026"
        noindex
        nofollow
      />

      <main
        ref={rootRef}
        className="error-portal-shell relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden px-4 pb-12 pt-24 text-foreground sm:px-6 sm:pb-16 sm:pt-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 [background-size:24px_24px] sm:[background-size:32px_32px] lg:[background-size:40px_40px]"
          style={{
            backgroundImage: `
              linear-gradient(
                45deg,
                transparent 47%,
                var(--primary) 48%,
                var(--primary) 49%,
                transparent 50%
              ),
              linear-gradient(
                -45deg,
                transparent 47%,
                var(--primary) 48%,
                var(--primary) 49%,
                transparent 50%
              )
            `,
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15 [background-size:48px_48px] sm:[background-size:64px_64px] lg:[background-size:80px_80px]"
          style={{
            backgroundImage: `
              linear-gradient(
                to right,
                var(--secondary) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                var(--secondary) 1px,
                transparent 1px
              )
            `,
            maskImage:
              'radial-gradient(circle at center, black 15%, transparent 85%)',
            WebkitMaskImage:
              'radial-gradient(circle at center, black 15%, transparent 85%)',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute left-[12%] top-[12%] size-52 rounded-full bg-primary/10 blur-[100px] sm:size-72 sm:blur-[120px]" />

          <div className="absolute bottom-[8%] right-[10%] size-60 rounded-full bg-secondary/10 blur-[110px] sm:size-80 sm:blur-[130px]" />

          <div className="absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[140px] sm:size-[38rem] sm:blur-[180px]" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {BACKGROUND_SQUARES.map(
            ({ className, innerClassName }, index) => (
              <div
                key={index}
                className={`error-square absolute border border-primary/20 bg-primary/5 shadow-lg shadow-primary/5 backdrop-blur-[2px] ${className}`}
              >
                <div
                  className={`absolute border border-secondary/20 ${innerClassName}`}
                />
              </div>
            ),
          )}
        </div>

        {SOUND_NOTES.map(
          ({ Component, className, depth }, index) => (
            <div
              key={index}
              aria-hidden="true"
              data-depth={depth}
              className={`error-note pointer-events-none absolute z-10 rounded-xl border border-white/15 bg-card/25 p-2 backdrop-blur-md sm:rounded-2xl sm:p-3 ${className}`}
            >
              <Component className="size-full drop-shadow-[0_0_14px_rgba(139,92,255,0.45)]" />
            </div>
          ),
        )}

        <section className="error-portal-card relative z-20 w-full max-w-3xl [transform-style:preserve-3d]">
          <span
            aria-hidden="true"
            className="error-border-portal"
          />

          <span
            aria-hidden="true"
            className="error-border-comet"
          />

          <span
            aria-hidden="true"
            className="error-border-pulse"
          />

          <div className="relative z-10 overflow-hidden rounded-[1.5rem] border border-white/10 bg-card/45 px-4 pb-7 pt-20 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:rounded-[2rem] sm:px-10 sm:pb-12 sm:pt-20">
            <span
              aria-hidden="true"
              className="error-scanline"
            />

            <div className="error-status-badge absolute right-4 top-4 z-20 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-3 py-2 text-secondary shadow-lg shadow-secondary/10 backdrop-blur-md sm:right-6 sm:top-6 sm:px-4">
              <TriangleAlert className="size-4 shrink-0" />

              <span className="truncate text-xs font-bold uppercase tracking-[0.14em] sm:text-sm">
                {copy.eyebrow}
              </span>
            </div>

            <div className="grid items-center gap-7 sm:gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
              <div
                className="error-code-stage relative flex min-h-44 items-center justify-center sm:min-h-52"
                aria-label={`Error ${status}`}
              >
                <span
                  aria-hidden="true"
                  className="error-code-ring"
                />

                <span
                  aria-hidden="true"
                  className="error-code-echo error-code-echo-one"
                >
                  {status}
                </span>

                <span
                  aria-hidden="true"
                  className="error-code-echo error-code-echo-two"
                >
                  {status}
                </span>

                <div
                  className="error-code-main"
                  aria-hidden="true"
                >
                  {String(status)
                    .split('')
                    .map((digit, index) => (
                      <span
                        key={index}
                        className="error-digit inline-block"
                      >
                        {digit}
                      </span>
                    ))}
                </div>
              </div>

              <div className="error-content space-y-5 text-center sm:space-y-6 md:text-left">
                <div className="space-y-3">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    {copy.title}
                  </h1>

                  <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {copy.description}
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap md:justify-start">
                  <Button3D
                    href="/"
                    variant="solid"
                    className="w-full sm:w-auto"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Home className="size-4" />
                      Beranda
                    </span>
                  </Button3D>

                  {isAuthenticated && (
                    <Button3D
                      href={dashboardHref}
                      variant="ghost"
                      className="w-full sm:w-auto"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </span>
                    </Button3D>
                  )}

                  <Button3D
                    onClick={() => window.history.back()}
                    variant="ghost"
                    className="w-full sm:w-auto"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ArrowLeft className="size-4" />
                      Kembali
                    </span>
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