import React from 'react'
import { Seo } from '@/components/seo/Seo'
import { createWebsiteJsonLd } from '@/lib/seo'

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
      <div className='relative'>
      <div className='h-screen'>Index</div>
      <div className='h-screen'>Index</div>

      </div>
    </>
  )
}

export default Index
