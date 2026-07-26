export type Competition = {
  id: string
  name: string
  description: string
  image: string        // e.g. '/images/mascot-olympiad.png' — leave '' to show a placeholder box
  guidebookUrl: string // external guidebook link — '#' until you have it
}

export const COMPETITIONS: Competition[] = [
  {
    id: 'olympiad',
    name: 'Olympiad',
    description: 'Information System Olympiad merupakan kompetisi olimpiade di bidang IT dan bisnis berskala nasional yang ditujukan bagi siswa/siswi SMA/SMK/sederajat. Kompetisi ini bertujuan untuk menguji kedalaman pemahaman teoretis dan wawasan logis peserta mengenai sistem informasi. IS-Olympiad hadir sebagai langkah awal untuk mengasah kompetensi dan mencetak talenta digital berprestasi di masa depan.',
    image: '/images/robot.png',
    guidebookUrl: '#',
  },
  {
    id: 'business-plan',
    name: 'Business Plan',
    description: 'Business case competition tingkat nasional yang menantang mahasiswa sederajat untuk melatih daya analitis kritis dalam membedah permasalahan industri riil. Ajang ini merupakan wadah bagi mahasiswa untuk memformulasikan dan mempresentasikan solusi yang tepat bagi perusahaan melalui implementasi Bisnis dan Teknologi Informasi (IT) yang komprehensif dan strategis.',
    image: '/images/action_plan.png',
    guidebookUrl: '#',
  },
  {
    id: 'business-it-case',
    name: 'Business IT Case',
    description: 'Business case competition tingkat nasional yang menantang mahasiswa sederajat untuk melatih daya analitis kritis dalam membedah permasalahan industri riil. Ajang ini merupakan wadah bagi mahasiswa untuk memformulasikan dan mempresentasikan solusi yang tepat bagi perusahaan melalui implementasi Bisnis dan Teknologi Informasi (IT) yang komprehensif dan strategis.',
    image: '/images/robot.png',
    guidebookUrl: '#',
  },
]
