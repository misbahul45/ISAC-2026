import '../css/app.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { AppLayout } from './components/layouts/AppLayout'

const appName = import.meta.env.VITE_APP_NAME || 'ISAC 2026'

type PageModule = {
  default: React.ComponentType<any> & { layout?: (page: React.ReactNode) => React.ReactNode }
}

createInertiaApp({
  title: (title) => title.includes(appName) ? title : `${title} | ${appName}`,
  resolve: (name) => {
    const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx', { eager: true })
    const page = pages[`./Pages/${name}.tsx`].default
    const layout = page.layout ?? ((pageNode: React.ReactNode) => pageNode)
    page.layout = (pageNode: React.ReactNode) => <AppLayout>{layout(pageNode)}</AppLayout>
    return { default: page }
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <React.StrictMode>
        <QueryProvider>
          <AuthProvider>
            <App {...props} />
          </AuthProvider>
        </QueryProvider>
      </React.StrictMode>,
    )
  },
})
