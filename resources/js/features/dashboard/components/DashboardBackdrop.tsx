import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import Sound1 from '@/components/shared/Sound1'
import Sound2 from '@/components/shared/Sound2'
import Sound3 from '@/components/shared/Sound3'
import Sound4 from '@/components/shared/Sound4'

const notes = [
  {
    Component: Sound1,
    className:
      'left-[2%] top-[12%] size-12 sm:left-[5%] sm:size-20',
    depth: 34,
    rotation: -7,
  },
  {
    Component: Sound2,
    className:
      'right-[2%] top-[18%] size-12 sm:right-[5%] sm:size-20',
    depth: 46,
    rotation: 8,
  },
  {
    Component: Sound3,
    className:
      'bottom-[10%] left-[4%] hidden size-20 sm:block',
    depth: 54,
    rotation: -5,
  },
  {
    Component: Sound4,
    className:
      'bottom-[13%] right-[4%] hidden size-20 sm:block',
    depth: 40,
    rotation: 6,
  },
]

const squares = [
  {
    className:
      'left-[7%] top-[8%] size-14 rotate-12 sm:size-20',
    depth: 13,
  },
  {
    className:
      'right-[9%] top-[8%] size-12 -rotate-12 sm:size-16',
    depth: 18,
  },
  {
    className:
      'left-[14%] top-[42%] size-9 rotate-45 sm:size-14',
    depth: 25,
  },
  {
    className:
      'right-[13%] top-[45%] size-14 rotate-[18deg] sm:size-20',
    depth: 29,
  },
  {
    className:
      'bottom-[10%] left-[12%] size-10 -rotate-[18deg] sm:size-16',
    depth: 21,
  },
  {
    className:
      'bottom-[8%] right-[13%] size-14 rotate-[25deg] sm:size-20',
    depth: 17,
  },
  {
    className:
      'left-[44%] top-[7%] hidden size-12 rotate-45 md:block',
    depth: 10,
  },
  {
    className:
      'bottom-[5%] left-[48%] hidden size-10 -rotate-12 md:block',
    depth: 15,
  },
]

export function DashboardBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!rootRef.current) return

      const root = rootRef.current

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (reducedMotion) return

      const noteElements =
        root.querySelectorAll<HTMLElement>('.dashboard-note')

      const squareElements =
        root.querySelectorAll<HTMLElement>('.dashboard-square')

      const glowElements =
        root.querySelectorAll<HTMLElement>('.dashboard-glow')

      const gridPrimary =
        root.querySelector<HTMLElement>('.dashboard-grid-primary')

      const gridSecondary =
        root.querySelector<HTMLElement>('.dashboard-grid-secondary')

      const cursorGlow =
        root.querySelector<HTMLElement>('.dashboard-cursor-glow')

      gsap.from(noteElements, {
        autoAlpha: 0,
        scale: 0.45,
        rotation: -20,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
      })

      gsap.from(squareElements, {
        autoAlpha: 0,
        scale: 0.5,
        rotation: -35,
        duration: 0.9,
        stagger: 0.06,
        ease: 'power3.out',
      })

      noteElements.forEach((element, index) => {
        gsap.to(element.querySelector('.dashboard-note-inner'), {
          y: index % 2 === 0 ? -10 : 10,
          rotation: index % 2 === 0 ? 5 : -5,
          duration: 3.8 + index * 0.45,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      squareElements.forEach((element, index) => {
        const inner =
          element.querySelector<HTMLElement>('.dashboard-square-inner')

        if (!inner) return

        gsap.to(inner, {
          y: index % 2 === 0 ? -12 : 12,
          rotation: index % 2 === 0 ? 9 : -9,
          duration: 4.5 + index * 0.32,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      glowElements.forEach((element, index) => {
        gsap.to(element, {
          scale: index % 2 === 0 ? 1.12 : 0.9,
          autoAlpha: index % 2 === 0 ? 0.85 : 0.6,
          duration: 5 + index,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      const noteTargets = Array.from(noteElements).map(element => ({
        element,
        depth: Number(element.dataset.depth ?? 30),
        x: gsap.quickTo(element, 'x', {
          duration: 0.85,
          ease: 'power3.out',
        }),
        y: gsap.quickTo(element, 'y', {
          duration: 0.85,
          ease: 'power3.out',
        }),
      }))

      const squareTargets = Array.from(squareElements).map(element => ({
        element,
        depth: Number(element.dataset.depth ?? 15),
        x: gsap.quickTo(element, 'x', {
          duration: 1.1,
          ease: 'power3.out',
        }),
        y: gsap.quickTo(element, 'y', {
          duration: 1.1,
          ease: 'power3.out',
        }),
      }))

      const glowTargets = Array.from(glowElements).map(element => ({
        depth: Number(element.dataset.depth ?? 12),
        x: gsap.quickTo(element, 'x', {
          duration: 1.4,
          ease: 'power3.out',
        }),
        y: gsap.quickTo(element, 'y', {
          duration: 1.4,
          ease: 'power3.out',
        }),
      }))

      const gridPrimaryX = gridPrimary
        ? gsap.quickTo(gridPrimary, 'x', {
            duration: 1.6,
            ease: 'power3.out',
          })
        : null

      const gridPrimaryY = gridPrimary
        ? gsap.quickTo(gridPrimary, 'y', {
            duration: 1.6,
            ease: 'power3.out',
          })
        : null

      const gridSecondaryX = gridSecondary
        ? gsap.quickTo(gridSecondary, 'x', {
            duration: 1.8,
            ease: 'power3.out',
          })
        : null

      const gridSecondaryY = gridSecondary
        ? gsap.quickTo(gridSecondary, 'y', {
            duration: 1.8,
            ease: 'power3.out',
          })
        : null

      const cursorX = cursorGlow
        ? gsap.quickTo(cursorGlow, 'x', {
            duration: 0.65,
            ease: 'power3.out',
          })
        : null

      const cursorY = cursorGlow
        ? gsap.quickTo(cursorGlow, 'y', {
            duration: 0.65,
            ease: 'power3.out',
          })
        : null

      const cursorOpacity = cursorGlow
        ? gsap.quickTo(cursorGlow, 'autoAlpha', {
            duration: 0.4,
            ease: 'power2.out',
          })
        : null

      const handlePointerMove = (event: PointerEvent) => {
        const viewportX =
          event.clientX / window.innerWidth - 0.5

        const viewportY =
          event.clientY / window.innerHeight - 0.5

        noteTargets.forEach(target => {
          target.x(viewportX * target.depth)
          target.y(viewportY * target.depth)
        })

        squareTargets.forEach(target => {
          target.x(viewportX * target.depth)
          target.y(viewportY * target.depth)
        })

        glowTargets.forEach(target => {
          target.x(viewportX * target.depth)
          target.y(viewportY * target.depth)
        })

        gridPrimaryX?.(viewportX * 10)
        gridPrimaryY?.(viewportY * 10)

        gridSecondaryX?.(viewportX * -7)
        gridSecondaryY?.(viewportY * -7)

        if (cursorGlow && cursorX && cursorY) {
          const bounds = root.getBoundingClientRect()

          cursorX(
            event.clientX -
              bounds.left -
              cursorGlow.offsetWidth / 2,
          )

          cursorY(
            event.clientY -
              bounds.top -
              cursorGlow.offsetHeight / 2,
          )

          cursorOpacity?.(1)
        }
      }

      const reset = () => {
        noteTargets.forEach(target => {
          target.x(0)
          target.y(0)
        })

        squareTargets.forEach(target => {
          target.x(0)
          target.y(0)
        })

        glowTargets.forEach(target => {
          target.x(0)
          target.y(0)
        })

        gridPrimaryX?.(0)
        gridPrimaryY?.(0)

        gridSecondaryX?.(0)
        gridSecondaryY?.(0)

        cursorOpacity?.(0)
      }

      const handleMouseOut = (event: MouseEvent) => {
        if (!event.relatedTarget) {
          reset()
        }
      }

      window.addEventListener(
        'pointermove',
        handlePointerMove,
        {
          passive: true,
        },
      )

      window.addEventListener(
        'mouseout',
        handleMouseOut,
      )

      window.addEventListener(
        'blur',
        reset,
      )

      return () => {
        window.removeEventListener(
          'pointermove',
          handlePointerMove,
        )

        window.removeEventListener(
          'mouseout',
          handleMouseOut,
        )

        window.removeEventListener(
          'blur',
          reset,
        )
      }
    },
    {
      scope: rootRef,
    },
  )

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="dashboard-grid-primary absolute -inset-8 opacity-20 [background-size:24px_24px] will-change-transform sm:[background-size:34px_34px]"
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
        className="dashboard-grid-secondary absolute -inset-8 opacity-15 [background-size:72px_72px] will-change-transform"
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
            'radial-gradient(circle at center, black 12%, transparent 86%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, black 12%, transparent 86%)',
        }}
      />

      <div
        data-depth="16"
        className="dashboard-glow absolute left-[8%] top-24 size-72 rounded-full bg-primary/10 blur-[120px] will-change-transform"
      />

      <div
        data-depth="22"
        className="dashboard-glow absolute bottom-10 right-[7%] size-80 rounded-full bg-secondary/10 blur-[135px] will-change-transform"
      />

      <div
        data-depth="9"
        className="dashboard-glow absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[170px] will-change-transform"
      />

      <div className="dashboard-cursor-glow absolute left-0 top-0 size-72 rounded-full bg-primary/10 opacity-0 blur-[110px] will-change-transform sm:size-96" />

      {squares.map(
        ({ className, depth }, index) => (
          <div
            key={`${className}-${index}`}
            data-depth={depth}
            className={`dashboard-square absolute will-change-transform ${className}`}
          >
            <div className="dashboard-square-inner relative size-full border border-primary/20 bg-primary/5 shadow-lg shadow-primary/5 backdrop-blur-[2px]">
              <span className="absolute inset-[26%] border border-secondary/20" />

              <span className="absolute -inset-px opacity-30 shadow-[0_0_24px_var(--primary)]" />
            </div>
          </div>
        ),
      )}

      {notes.map(
        (
          {
            Component,
            className,
            depth,
            rotation,
          },
          index,
        ) => (
          <div
            key={`${className}-${index}`}
            data-depth={depth}
            className={`dashboard-note absolute z-10 will-change-transform ${className}`}
          >
            <div
              className="dashboard-note-inner relative size-full rounded-2xl border border-white/15 bg-card/25 p-2.5 shadow-xl shadow-black/10 backdrop-blur-md"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />

              <Component className="relative z-10 size-full drop-shadow-[0_0_14px_rgba(139,92,255,0.45)]" />
            </div>
          </div>
        ),
      )}

      <div className="absolute inset-x-[8%] top-[20%] h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="absolute inset-x-[14%] bottom-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  )
}