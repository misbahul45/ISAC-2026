import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { IMAGES } from '@/constants/general'
import { Toaster } from '../ui/sonner'
import MusicCursor from '../shared/MusicCursor'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex flex-col">
      <Header />

      <div className="relative flex-1 min-h-0">
        <div
          className="fixed inset-0 z-0 bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${IMAGES.bg})`,
          }}
        />
        <Toaster position='top-right' />
        <MusicCursor />
        <div className="relative z-10">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  )
}