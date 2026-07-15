import React from 'react'
import RegistrationLayout from './components/RegistrationLayout'
import { COMPETITIONS } from '@/constants/registration'
import { Button } from '@/components/ui/button'

const Index = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mt-8">
      {COMPETITIONS.map((competition, index) => {
        const isLastOdd =
          COMPETITIONS.length % 2 === 1 &&
          index === COMPETITIONS.length - 1

        return (
          <div
            key={competition.id}
            className={`flex h-full flex-col rounded-lg border-4 border-primary/80 p-6 text-center text-primary-foreground ${
              isLastOdd ? "md:col-span-2 xl:col-span-1" : ""
            }`}
          >
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              {competition.name}
            </h2>

            <p className="flex-1 text-sm md:text-base text-primary-foreground/80">
              {competition.description}
            </p>

            <Button className="mt-6 w-full rounded-sm font-semibold">
              Register
            </Button>
          </div>
        )
      })}
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