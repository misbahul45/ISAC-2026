import React from 'react'
import Steps from './Steps'
import { Image } from "@unpic/react";
import { IMAGES } from '@/constants/general';
import { Seo } from '@/components/seo/Seo';

const RegistrationLayout = ({ children, title, description }: { children: React.ReactNode; title: string, description: string }) => {
  return (
    <>
      <Seo
          title={title}
          description={description}
          canonical={`/${title.toLowerCase().replace(/\s+/g, '-')}`}
          type="website"
          noindex
      />
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
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