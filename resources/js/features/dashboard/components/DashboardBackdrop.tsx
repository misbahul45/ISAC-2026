import Sound1 from '@/components/shared/Sound1'
import Sound2 from '@/components/shared/Sound2'
import Sound3 from '@/components/shared/Sound3'
import Sound4 from '@/components/shared/Sound4'

const notes = [
  { Component: Sound1, className: 'left-[2%] top-32 size-12 sm:left-[5%] sm:size-20' },
  { Component: Sound2, className: 'right-[2%] top-44 size-12 sm:right-[5%] sm:size-20' },
  { Component: Sound3, className: 'bottom-24 left-[4%] hidden size-20 sm:block' },
  { Component: Sound4, className: 'bottom-32 right-[4%] hidden size-20 sm:block' },
]

const squares = [
  'left-[8%] top-[12%] size-16 rotate-12',
  'right-[9%] top-[10%] size-12 -rotate-12',
  'bottom-[14%] left-[12%] size-10 rotate-45',
  'bottom-[10%] right-[13%] size-16 rotate-[18deg]',
]

export function DashboardBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 [background-size:24px_24px] sm:[background-size:34px_34px]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 47%, var(--primary) 48%, var(--primary) 49%, transparent 50%),
            linear-gradient(-45deg, transparent 47%, var(--primary) 48%, var(--primary) 49%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-15 [background-size:72px_72px]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--secondary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--secondary) 1px, transparent 1px)
          `,
          maskImage: 'radial-gradient(circle at center, black 12%, transparent 86%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 12%, transparent 86%)',
        }}
      />
      <div className="absolute left-[8%] top-24 size-72 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-10 right-[7%] size-80 rounded-full bg-secondary/10 blur-[135px]" />
      <div className="absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[170px]" />

      {squares.map((className) => (
        <div key={className} className={`absolute border border-primary/20 bg-primary/5 backdrop-blur-[2px] ${className}`}>
          <span className="absolute inset-[26%] border border-secondary/20" />
        </div>
      ))}

      {notes.map(({ Component, className }) => (
        <div key={className} className={`error-note absolute z-10 rounded-2xl border border-white/15 bg-card/25 p-2.5 backdrop-blur-md ${className}`}>
          <Component className="size-full drop-shadow-[0_0_14px_rgba(139,92,255,0.45)]" />
        </div>
      ))}
    </div>
  )
}
