import React from 'react'
import Steps from './Steps'
import { Seo } from '@/components/seo/Seo'
import { usePage } from '@inertiajs/react'
import Sound1 from './Sound1'
import Sound2 from './Sound2'

const SOUND_POSITIONS_TOP = [
  { component: 'sound1' as const, className: 'absolute -top-10 left-2 md:-top-8 md:left-0 w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20' },
  { component: 'sound2' as const, className: 'absolute -top-6 left-12 md:top-2 md:left-16 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20' },
]

const SOUND_POSITIONS_BOTTOM = [
  { component: 'sound1' as const, className: 'absolute top-10 right-6 md:top-4 md:right-0 w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20' },
  { component: 'sound2' as const, className: 'absolute top-14 right-14 md:top-16 md:right-16 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20' },
]

const RegistrationLayout = ({ children, title, description }: { children: React.ReactNode; title: string, description: string }) => {
  const { url } = usePage()

  return (
    <>
      <Seo
        title={title}
        description={description}
        canonical={url}
        type="website"
        noindex
      />
      <div className="flex flex-col items-center justify-center overflow-y-hidden pt-12 pb-6 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 md:min-h-screen mx-auto relative overflow-hidden">
        {url === '/registration' && (
          <>
            <div
              className="
                absolute
                -top-40
                left-1/2
                -translate-x-1/2
                w-[1200px]
                h-[500px]
                rounded-full
                bg-white/20
                blur-[150px]
                opacity-70
                pointer-events-none
                z-[5]
              "
            />

            <div
              className="
                absolute
                top-0
                -left-40
                w-[350px]
                h-full
                bg-white/10
                blur-[120px]
                pointer-events-none
                z-[5]
              "
            />

            <div
              className="
                absolute
                top-0
                -right-40
                w-[350px]
                h-full
                bg-white/10
                blur-[120px]
                pointer-events-none
                z-[5]
              "
            />
          </>
        )}

        <div className="flex justify-center w-full max-w-7xl gap-32 items-center relative z-[6]">
          {SOUND_POSITIONS_TOP.map((item, index) => (
            <React.Fragment key={`top-${index}`}>
              {item.component === 'sound1' ? (
                <Sound1 className={item.className} />
              ) : (
                <Sound2 className={item.className} />
              )}
            </React.Fragment>
          ))}
          <Steps />
          {SOUND_POSITIONS_BOTTOM.map((item, index) => (
            <React.Fragment key={`bottom-${index}`}>
              {item.component === 'sound1' ? (
                <Sound1 className={item.className} />
              ) : (
                <Sound2 className={item.className} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="w-full max-w-7xl responsive z-10">
          {children}
        </div>
      </div>
    </>
  )
}

export default RegistrationLayout