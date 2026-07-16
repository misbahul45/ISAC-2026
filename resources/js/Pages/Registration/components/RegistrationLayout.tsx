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
      <div className="flex flex-col items-center justify-center pt-8 pb-6 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 min-h-screen mx-auto relative">
        <div className="flex justify-center w-full gap-32 items-center relative">
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
            className=" top-12 right-8 size-12 absolute md:top-6 md:right-2 sm:size-14 md:size-20"
          />
          <img
            src={IMAGES.sound2}
            alt="sound2"
            className="top-16 right-16 size-12 absolute md:top-18 md:right-20 sm:size-16 md:size-20"
          />
        </div>

        {url === '/registration' && <div className="bg-linear-to-b z- from-white/10 via-white/5 to-transparent h-[30%] rounded-b-[20%] w-full absolute top-0 left-0" />}

        {url === '/registration' &&<div className='bg-linear-to-l z- from-white/10 via-white/5 to-transparent absolute h-full w-[10%] right-0 rounded-l-sm top-02' />}
        {url === '/registration' &&<div className='bg-linear-to-r z- from-white/10 via-white/5 to-transparent absolute h-full w-[10%] left-0 rounded-l-sm top-02' />}


        <div className="w-full max-w-7xl px-4 responsive overflow-y-hidden z-20 backdrop-blur[10px]">
          {children}
        </div>
      </div>
    </>
  )
}

export default RegistrationLayout