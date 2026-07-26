import { cn } from '@/lib/utils'
import { TIMELINE, type TimelineEvent } from '@/constants/timeline'

function DateBadge({ event }: { event: TimelineEvent }) {
  return (
    <div className="flex w-32 h-full shrink-0 flex-col items-center border-2 border-primary bg-primary/40 px-3 py-2 text-center leading-tight text-primary-foreground">
      <span className="text-lg font-extrabold md:text-xl text-shadow-[0_0_8px_#fff]">{event.day}</span>
      <span className="text-[12px] font-medium opacity-90 text-shadow-[0_0_8px_#fff]">{event.month}</span>
    </div>
  )
}

export function Timeline() {
  return (
    <section id="timeline" className="relative overflow-hidden px-4 py-24">
      <div className="relative z-10 mx-auto max-w-4xl">
        <h2 className="mb-16 text-center text-4xl font-bold tracking-wide md:text-5xl text-shadow-[0_0_8px_#fff]">TIMELINE</h2>

        <ul className="flex flex-col gap-6">
          {TIMELINE.map((event, index) => {
            const badgeLeft = index % 2 === 0
            return (
              <li key={event.id} className="grid items-center md:grid-cols-[1fr_8rem_1fr]">
                <div
                  className={cn(
                    'flex flex-row items-center gap-2 rounded-[1.25rem] border border-primary/30 bg-primary/5 py-0 pr-5 shadow-lg shadow-primary/10 backdrop-blur-sm',
                    badgeLeft
                      ? 'md:col-start-2 md:col-end-4 md:justify-self-start'
                      : 'md:flex-row-reverse md:pr-0 md:pl-5 md:col-start-1 md:col-end-3 md:justify-self-end',
                  )}
                >
                  <DateBadge event={event} />
                  <p className="text-base font-extrabold tracking-wide text-foreground/90 md:text-lg text-shadow-[0_0_6px_#fff]">
                    {event.label}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
