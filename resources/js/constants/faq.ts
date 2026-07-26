export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Kapan terakhir saya membayar setelah membuat akun?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: 'faq-2',
    question: 'Bisakah saya membuat akun di luar batch pendaftaran?',
    answer:
      'Pendaftaran akun hanya dapat dilakukan selama masa periode pendaftaran (batch) yang sedang dibuka sesuai dengan timeline resmi ISAC 2026. Pastikan memantau jadwal pendaftaran pada halaman utama.',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana cara mengumpulkan berkas atau karya kompetisi?',
    answer:
      'Pengumpulan berkas dan karya dilakukan melalui dashboard peserta setelah Anda berhasil login dan mendaftar pada cabang kompetisi yang dipilih.',
  },
  {
    id: 'faq-4',
    question: 'Apakah ada biaya pendaftaran untuk mengikuti ISAC 2026?',
    answer:
      'Biaya pendaftaran berbeda untuk tiap gelombang (Early Bird & Normal Bird). Detail informasi pembayaran dapat dilihat pada buku panduan (Guidebook) resmi kompetisi.',
  },
]
