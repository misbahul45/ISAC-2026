export interface SponsorPartner {
  id: string
  name: string
  logo: string
  isFreeport?: boolean
}

export const SPONSORS_PARTNERS: SponsorPartner[] = [
  {
    id: 'telkomsel',
    name: 'Telkomsel',
    logo: '/images/Telkomsel.png',
  },
  {
    id: 'pelindo',
    name: 'PELINDO',
    logo: '/images/Pelindo.png',
  },
  {
    id: 'pln',
    name: 'PLN',
    logo: '/images/PLN.png',
  },
  {
    id: 'freeport',
    name: 'PT FREEPORT INDONESIA',
    logo: '/images/freeport.png',
    isFreeport: true,
  },
  {
    id: 'pertamina',
    name: 'PERTAMINA',
    logo: '/images/Pertamina.png',
  },
  {
    id: 'mandiri',
    name: 'mandiri',
    logo: '/images/Mandiri.png',
  },
]
