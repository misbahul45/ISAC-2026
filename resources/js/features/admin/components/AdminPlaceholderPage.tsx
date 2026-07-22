import { Seo } from '@/components/seo/Seo'
import { AdminPageHeader } from './AdminPageHeader'
import { ComingSoonPanel } from './ComingSoonPanel'

export function AdminPlaceholderPage({ title, description, endpoint, canonical }: { title: string; description: string; endpoint: string; canonical: string }) {
  return (
    <>
      <Seo title={`${title} Admin`} description={description} canonical={canonical} noindex />
      <AdminPageHeader title={title} description={description} />
      <ComingSoonPanel title={title} description={description} endpoint={endpoint} />
    </>
  )
}

