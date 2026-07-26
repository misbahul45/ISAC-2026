import { SPONSORS_PARTNERS } from '@/constants/sponsors'
import { IMAGES } from '@/constants/general'

export function SponsorPartner() {
  return (
    <section id="media-partner" className="relative overflow-hidden px-4 py-20 z-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center text-4xl font-extrabold tracking-wide text-white text-shadow-[0_0_15px_#fff] md:text-5xl">
          Our Sponsor &amp; Partner
        </h2>

        <div className="relative z-10 mx-auto max-w-5xl rounded-3xl border border-purple-400/60 bg-purple-950/40 p-8 md:p-14 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.3)]">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-12 items-center justify-items-center">
            {SPONSORS_PARTNERS.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex w-full max-w-[170px] md:max-w-[200px] items-center justify-center transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="w-full h-auto max-h-16 md:max-h-20 object-contain drop-shadow-md"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none relative -mt-[160px] sm:-mt-[240px] md:-mt-[340px] lg:-mt-[440px] flex justify-center z-0">
          <img
            src={IMAGES.bgHero}
            alt="Sponsor Pedestal Plate"
            className="w-full max-w-6xl scale-110 md:scale-115 object-contain opacity-100 drop-shadow-[0_0_45px_rgba(168,85,247,0.8)]"
          />
        </div>

        <div aria-hidden="true" className="pointer-events-none relative">
          <div className="mx-auto -mt-6 h-12 w-3/4 max-w-2xl rounded-[100%] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent blur-xl" />
          <div className="mx-auto -mt-10 h-6 w-1/2 max-w-lg rounded-[100%] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent blur-md" />
        </div>
      </div>
    </section>
  )
}
