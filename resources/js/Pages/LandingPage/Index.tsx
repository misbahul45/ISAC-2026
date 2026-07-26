import React from 'react'
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

const Index = () => {
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

      <main className="relative">
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
