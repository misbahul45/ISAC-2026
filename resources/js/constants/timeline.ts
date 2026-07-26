export type TimelineEvent = {
  id: string
  day: string
  month: string
  label: string
}

export const TIMELINE: TimelineEvent[] = [
  { id: 'early-bird',        day: '22 - 6',  month: 'June July', label: 'Early Bird Registration' },
  { id: 'normal-bird',       day: '7 - 15',  month: 'July',       label: 'Normal Bird Registration' },
  { id: 'technical-meeting', day: '16',      month: 'July',       label: 'Technical Meeting & Case Release' },
  { id: 'submission',        day: '17 - 23', month: 'July',       label: 'Pengerjaan & Submission' },
  { id: 'finalist',          day: '2',       month: 'August',     label: 'Finalist Presentation' },
  { id: 'winner',            day: '3',       month: 'August',     label: 'Pengumuman Juara' },
]
