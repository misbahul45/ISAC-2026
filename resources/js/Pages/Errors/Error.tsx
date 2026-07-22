import { ErrorExperience } from '@/features/errors/components/ErrorExperience'

type ErrorPageProps = {
  status: number
}

export default function ErrorPage({ status }: ErrorPageProps) {
  return <ErrorExperience status={status} />
}
