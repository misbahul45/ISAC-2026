import { Link } from '@inertiajs/react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { COMPETITIONS } from '@/constants/competitions'

const LOTTIE = [
  { delay: '0s',   duration: '2s' }
]

export function Competitions() {
  return (
    <section id="competition" className="relative overflow-hidden px-4 py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-20">
        {COMPETITIONS.map((comp, index) => {
          const isReversed = index % 2 === 1 // logika untuk ngeflip yezzurr alpro kepake
          return (
            <div
              key={comp.id}
              className={cn(
                'flex flex-col items-center gap-8 md:flex-row md:gap-12',
                isReversed && 'md:flex-row-reverse',
              )}
            >
              <div className={cn('flex-1 text-center', isReversed ? 'md:text-right' : 'md:text-left')}>
                <h3 className="md:relative z-3 md:mb-[-14px] mb-4 text-3xl font-bold md:text-4xl text-shadow-[0_0_8px_#fff]">{comp.name}</h3>

                <div className="rounded-3xl border border-white/10 bg-card/50 p-6 backdrop-blur-md md:p-8">
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {comp.description}
                  </p>

                  <div
                    className={cn(
                      'mt-6 flex flex-wrap justify-center gap-3',
                      isReversed ? 'md:justify-end' : 'md:justify-start',
                    )}
                  >
                    <Link
                      href={ROUTES.register}
                      className={cn(buttonVariants({ size: 'lg' }), 'bg-[#F5A623] text-[#0F1329] hover:bg-[#F5A623]/90')}
                    //   bg-gradient-to-b from-red-500 via-orange-500 to-yellow-500 // untuk gradient nanti
                    >
                      Register
                    </Link>
                    <a
                      href={comp.guidebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }))}
                    >
                      Guidebook
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 justify-center">
                {LOTTIE.map((lottie, i) => (
                  <img
                    key={i}
                    src={comp.image}
                    alt={comp.name}
                    className="w-56 md:w-72"
                    style={{ animation: `floatUp ${lottie.duration} ease-in-out infinite`, animationDelay: lottie.delay }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
