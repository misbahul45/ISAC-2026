import { useEffect, useRef } from 'react'
import { IMAGES } from '@/constants/general'

const BLOBS = [
  { className: '-left-24 top-[12%] h-72 w-72 bg-primary/20',        factor: 0.12 },
  { className: 'right-[-6rem] top-[45%] h-80 w-80 bg-secondary/15', factor: 0.06 },
  { className: 'left-[20%] bottom-[8%] h-64 w-64 bg-primary/15',    factor: 0.18 },
]

const VECTORS = [
  { className: 'left-[6%] top-[14%] w-16 md:w-24',     rotate: 12, factor: -0.20 },
  { className: 'right-[8%] top-[30%] w-12 md:w-20',    rotate: -6, factor: 0.25 },
  { className: 'left-[12%] bottom-[16%] w-14 md:w-20', rotate: 8,  factor: -0.15 },
]

export function LandingBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--scroll', String(window.scrollY))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[120px] ${blob.className}`}
          style={{ transform: `translateY(calc(var(--scroll, 0) * ${blob.factor}px))` }}
        />
      ))}

      {VECTORS.map((v, i) => (
        <img
          key={i}
          src={IMAGES.vector}
          alt=""
          aria-hidden="true"
          className={`w-12 md:w-16 absolute rounded-2xl opacity-80 ${v.className}`}
          style={{ transform: `translateY(calc(var(--scroll, 0) * ${v.factor}px)) rotate(${v.rotate}deg)` }}
        />
      ))}
    </div>
  )
}
