export interface TalkshowBenefit {
  id: string
  text: string
}

export interface TalkshowInfo {
  titlePrimary: string
  titleSecondary: string
  description: string
  contactPersonText: string
  contactPersonUrl: string
  registerText: string
  registerUrl: string
  image: string
}

export const TALKSHOW_INFO: TalkshowInfo = {
  titlePrimary: 'TALK',
  titleSecondary: 'SHOW',
  description:
    'Information System Olympiad merupakan kompetisi olimpiade di bidang IT dan bisnis berskala nasional yang ditujukan bagi siswa/siswi SMA/SMK/sederajat. Kompetisi ini bertujuan untuk menguji kedalaman pemahaman teoretis dan wawasan logis peserta mengenai sistem informasi. IS-Olympiad hadir sebagai langkah awal untuk mengasah kompetensi dan mencetak talenta digital berprestasi di masa depan.',
  contactPersonText: 'Contact Person',
  contactPersonUrl: '#',
  registerText: 'Register',
  registerUrl: '/auth/register',
  image: '/images/Union.png',
}

export const TALKSHOW_BENEFITS: TalkshowBenefit[] = [
  {
    id: 'benefit-1',
    text: 'Memperoleh pemahaman mengenai prinsip-prinsip ui dan ux',
  },
  {
    id: 'benefit-2',
    text: 'Memperoleh pemahaman mengenai prinsip-prinsip ui dan ux',
  },
  {
    id: 'benefit-3',
    text: 'Memperoleh pemahaman mengenai prinsip-prinsip ui dan ux',
  },
  {
    id: 'benefit-4',
    text: 'Memperoleh pemahaman mengenai prinsip-prinsip ui dan ux',
  },
]
