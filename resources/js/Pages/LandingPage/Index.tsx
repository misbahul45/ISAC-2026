import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Seo } from '@/components/seo/Seo'
import { createWebsiteJsonLd } from '@/lib/seo'
import { AnimatedBackground } from '@/components/shared/AnimatedBackground'
// import { SectionDecor } from '@/components/shared/SectionDecor'
import { Hero } from "./sections/Hero";
import { Competitions } from "./sections/Competitions";
import { Timeline } from "./sections/Timeline";
import { Talkshow } from "./sections/Talkshow";
import { SponsorPartner } from "./sections/SponsorPartner";
import { Faq } from "./sections/Faq";
import { LandingBackground } from '@/components/shared/LandingBackground';

gsap.registerPlugin(useGSAP, ScrollTrigger)

const Index = () => {
  const mainRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!mainRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const sections = gsap.utils.toArray<HTMLElement>(
      ':scope > section',
      mainRef.current,
    )

    sections.forEach((section) => {
      gsap.from(section, {
        autoAlpha: 0,
        y: 64,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'opacity,transform,visibility',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true,
        },
      })
    })
  }, { scope: mainRef })

  return (
    <>
      <Seo
        description='Platform resmi pendaftaran kompetisi ISAC 2026 untuk Olimpiade, Business Plan, dan Business IT Case.'
        canonical='/'
        image='/logo.png'
        imageAlt='Logo ISAC 2026'
        keywords={['ISAC 2026', 'Olimpiade', 'Business Plan', 'Business IT Case']}
        author='ISAC 2026'
        jsonLd={createWebsiteJsonLd()}
      />

      <LandingBackground />

      <main ref={mainRef} className="relative">
        <Hero />
        <Competitions />
        <Timeline />
        <Talkshow />
        <SponsorPartner />
        <Faq />
      </main>
    </>
  )
}

export default Index
