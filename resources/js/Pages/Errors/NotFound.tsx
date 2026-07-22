import { ErrorExperience } from '@/features/errors/components/ErrorExperience'

type NotFoundProps = {
  status?: number
}

export default function NotFound({ status = 404 }: NotFoundProps) {
  return <ErrorExperience status={status} />
}
