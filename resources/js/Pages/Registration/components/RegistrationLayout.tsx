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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background py-28">
        <div className="flex justify-center w-full gap-32 items-center relative">
          <img
            src={IMAGES.sound1}
            alt="sound1"
            className="absolute -top-10 left-2 md:size-20"
          />
          <img
            src={IMAGES.sound2}
            alt="sound2"
            className="absolute top-4 left-32 md:size-28"
          />
          <Steps />
          <img
            src={IMAGES.sound1}
            alt="sound1"
            className="absolute top-6 right-2 md:size-20"
          />
          <img
            src={IMAGES.sound2}
            alt="sound2"
            className="absolute top-18 right-28 md:size-28"
          />
        </div>
        {children}
      </div>
    </>
  )
}

export default RegistrationLayout