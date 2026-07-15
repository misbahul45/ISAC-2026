import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { IMAGES } from '@/constants/general'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {


  return (
    <div>
      <Header />

      <div className="responsive relative min-h-screen">
        <div
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: `url(${IMAGES.bg})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-20">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  )
}