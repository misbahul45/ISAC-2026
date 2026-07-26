import { cn } from '@/lib/utils'

type BgCircle = {
  top: string
  left: string
  size: number
  opacity: number
  blur: number
  from?: 'sm' | 'md'
}

const CIRCLES: BgCircle[] = [
  { top: '8%',  left: '6%',  size: 90,  opacity: 0.35, blur: 2 },
  { top: '16%', left: '82%', size: 140, opacity: 0.25, blur: 4, from: 'sm' },
  { top: '36%', left: '14%', size: 56,  opacity: 0.4,  blur: 1 },
  { top: '58%', left: '88%', size: 72,  opacity: 0.3,  blur: 2 },
  { top: '76%', left: '7%',  size: 124, opacity: 0.22, blur: 5, from: 'sm' },
  { top: '84%', left: '72%', size: 48,  opacity: 0.38, blur: 1 },
  { top: '5%',  left: '48%', size: 44,  opacity: 0.3,  blur: 1 },
  { top: '68%', left: '42%', size: 64,  opacity: 0.2,  blur: 3, from: 'md' },
  { top: '42%', left: '94%', size: 38,  opacity: 0.32, blur: 1 },
  { top: '91%', left: '28%', size: 84,  opacity: 0.24, blur: 3 },
]

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 [background-size:22px_22px] sm:[background-size:28px_28px] md:[background-size:32px_32px]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 47%, var(--primary) 48%, var(--primary) 49%, transparent 50%),
            linear-gradient(-45deg, transparent 47%, var(--primary) 48%, var(--primary) 49%, transparent 50%)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-20 [background-size:44px_44px] sm:[background-size:56px_56px] md:[background-size:64px_64px]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          maskImage: 'radial-gradient(circle at center, black, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 85%)',
        }}
      />

      {CIRCLES.map((c, i) => (
        <div
          key={i}
          className={cn(
            'absolute rounded-full border border-primary/20 bg-primary/10',
            c.from === 'sm' ? 'hidden sm:block' : c.from === 'md' ? 'hidden md:block' : 'block',
          )}
          style={{
            top: c.top,
            left: c.left,
            width: `clamp(${Math.round(c.size * 0.55)}px, ${c.size / 8}vw, ${c.size}px)`,
            height: `clamp(${Math.round(c.size * 0.55)}px, ${c.size / 8}vw, ${c.size}px)`,
            opacity: c.opacity,
            filter: `blur(${c.blur}px)`,
          }}
        >
          <div className="absolute inset-[18%] rounded-full border border-primary/20" />
          <div className="absolute inset-[36%] rounded-full bg-primary/20" />
        </div>
      ))}

      <div className="absolute left-[-80px] top-[5%] h-[240px] w-[240px] rounded-full bg-primary/20 blur-[100px] sm:left-[5%] sm:h-[360px] sm:w-[360px] sm:blur-[130px] lg:left-1/4 lg:top-1/4 lg:h-[600px] lg:w-[600px] lg:blur-[150px]" />
      <div className="absolute bottom-[2%] right-[-100px] h-[280px] w-[280px] rounded-full bg-primary/20 blur-[100px] sm:right-[5%] sm:h-[400px] sm:w-[400px] sm:blur-[130px] lg:bottom-1/4 lg:right-1/4 lg:h-[600px] lg:w-[600px] lg:blur-[150px]" />
      <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px] sm:h-[600px] sm:w-[600px] sm:blur-[170px] lg:h-[900px] lg:w-[900px] lg:blur-[200px]" />
    </div>
  )
}
