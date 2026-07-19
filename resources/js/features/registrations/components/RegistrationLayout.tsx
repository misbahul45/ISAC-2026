import React from 'react'
import Steps from './Steps'
import { IMAGES } from '@/constants/general'
import { Seo } from '@/components/seo/Seo'
import { usePage } from '@inertiajs/react'

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
      <div className="flex flex-col items-center justify-center pt-8 pb-6 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 min-h-screen mx-auto relative overflow-hidden">
        {url === '/registration' && (
          <>
            <div className="absolute top-0 left-0 right-0 h-[30%] bg-linear-to-b from-white/40 via-white/10 to-transparent rounded-b-[30%] z-[5] pointer-events-none" />
            <div className="absolute top-0 left-0 h-full w-[20%] bg-linear-to-r from-white/15 via-white/5 to-transparent z-[5] pointer-events-none" />
            <div className="absolute top-0 right-0 h-full w-[20%] bg-linear-to-l from-white/15 via-white/5 to-transparent z-[5] pointer-events-none" />
          </>
        )}

        <div className="flex justify-center w-full max-w-7xl gap-32 items-center relative z-[6]">
          <img
            src={IMAGES.sound1}
            alt="sound1"
            className="absolute -top-12 left-4 md:-top-10 md:left-2 size-10 sm:size-14 md:size-20"
          />
          <img
            src={IMAGES.sound2}
            alt="sound2"
            className="absolute -top-8 left-10 md:top-4 md:left-20 size-12 sm:size-16 md:size-20"
          />
          <Steps />
          <img
            src={IMAGES.sound1}
            alt="sound1"
            className="top-12 right-8 size-12 absolute md:top-6 md:right-2 sm:size-14 md:size-20"
          />
          <img
            src={IMAGES.sound2}
            alt="sound2"
            className="top-16 right-16 size-12 absolute md:top-18 md:right-20 sm:size-16 md:size-20"
          />
        </div>

        {/* Content */}
        <div className="w-full max-w-7xl px-4 responsive z-10 ">
          {children}
        </div>
      </div>
    </>
  )
}

export default RegistrationLayout