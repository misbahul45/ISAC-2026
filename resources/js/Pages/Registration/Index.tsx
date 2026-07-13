import React from 'react'
import RegistrationLayout from './components/RegistrationLayout'
import { COMPETITIONS } from '@/constants/registration'
import { Button } from "@/components/ui/button"

const Index = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 flex justify-between gap-6">
      {COMPETITIONS.map((competition) => (
        <div key={competition.id} className="mb-6 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4 ">{competition.name}</h2>
          <div className='border-2 border-primary/80 p-4 rounded-md'>
            <p className="text-primary-foreground/80 text-medium mb-4">{competition.description}</p>
            <Button className={'rounded-sm font-semibold'}>Register</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

Index.layout = (page: React.ReactNode) => (
  <RegistrationLayout
    title="Registrasi"
    description="Pilih kategori lomba yang ingin Anda ikuti untuk memulai proses pendaftaran."
  >
    {page}
  </RegistrationLayout>
)

export default Index