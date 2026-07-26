import { Link } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import { TALKSHOW_INFO, TALKSHOW_BENEFITS } from '@/constants/talkshow'

export function Talkshow() {
  return (
    <section id="talkshow" className="relative overflow-hidden px-4 py-20 z-10">
      <div className="mx-auto max-w-6xl">
        <div className="relative">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="flex flex-col text-5xl font-black tracking-wider md:text-6xl">
                <span className="text-white text-shadow-[0_0_15px_#fff]">
                  {TALKSHOW_INFO.titlePrimary}
                </span>
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-white drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  {TALKSHOW_INFO.titleSecondary}
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground/90 md:text-base">
                {TALKSHOW_INFO.description}
              </p>

              <div className="mt-14">
                <h3 className="mb-8 text-center text-4xl font-extrabold tracking-wide text-white text-shadow-[0_0_15px_#fff] md:text-5xl">
                  Benefit
                </h3>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-5">
                  {TALKSHOW_BENEFITS.map((benefit) => (
                    <div
                      key={benefit.id}
                      className={cn(
                        'flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-purple-400/50 bg-purple-950/50 p-4 text-center backdrop-blur-md',
                        'shadow-[0_0_25px_rgba(147,51,234,0.2)] transition-all duration-300',
                        'hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:-translate-y-1',
                      )}
                    >
                      <p className="text-xs font-medium leading-relaxed text-white/90 md:text-sm">
                        {benefit.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center lg:col-span-5">
              <div className="relative mx-auto my-6 flex items-center justify-center pb-16 pr-12">
                <img
                  src={TALKSHOW_INFO.image}
                  alt="ISAC 2026 Talkshow Cyber Ring Main"
                  className="relative z-10 w-64 object-contain drop-shadow-[0_0_35px_rgba(168,85,247,0.5)] md:w-80 lg:w-96"
                  style={{
                    animation: 'floatUp 6s ease-in-out infinite',
                  }}
                />
                <img
                  src={TALKSHOW_INFO.image}
                  alt="ISAC 2026 Talkshow Cyber Ring Small"
                  className="absolute -bottom-4 -right-2 z-20 w-48 object-contain drop-shadow-[0_0_35px_rgba(6,182,212,0.6)] md:-bottom-8 md:-right-6 md:w-60 lg:-bottom-10 lg:-right-8 lg:w-72"
                  style={{
                    animation: 'floatUp 7s ease-in-out infinite 1s',
                  }}
                />
              </div>

              <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-4">
                <a
                  href={TALKSHOW_INFO.contactPersonUrl}
                  className="rounded-full border border-purple-400/80 bg-purple-600/30 px-5 py-2 text-xs font-medium text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 hover:bg-purple-600/50 md:text-sm"
                >
                  {TALKSHOW_INFO.contactPersonText}
                </a>
                <Link
                  href={TALKSHOW_INFO.registerUrl}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 text-xs font-medium text-white shadow-[0_0_20px_rgba(147,51,234,0.7)] transition-all duration-300 hover:opacity-90 md:text-sm"
                >
                  {TALKSHOW_INFO.registerText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
