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

      <div className="flex-1 min-h-0">
        <Toaster position='top-right' />
        <MusicCursor />
        <div className="relative overflow-y-hidden">
          <div
            className="fixed top-0 left-0 w-full h-full max-h-full z-0 bg-cover bg-no-repeat bg-center"
            style={{
              backgroundImage: `url(${IMAGES.bg})`,
            }}
          /> 
          {children}
        </div>
      </div>

      <Footer />
    </div>
  )
}