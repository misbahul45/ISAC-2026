import React from 'react'
import { Link } from '@inertiajs/react'
import { IMAGES } from '@/constants/general'

const LinkedinIcon = () => (
  <svg className="size-4 fill-current" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2v-8.37H6.46M7.83 6.67a1.64 1.64 0 0 0-1.65 1.64 1.65 1.65 0 0 0 1.65 1.65 1.65 1.65 0 0 0 1.65-1.65 1.65 1.65 0 0 0-1.65-1.64Z" />
  </svg>
)

const InstagramIcon = () => (
  <svg className="size-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
  </svg>
)

const YoutubeIcon = () => (
  <svg className="size-4 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
  </svg>
)

const TwitterIcon = () => (
  <svg className="size-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TiktokIcon = () => (
  <svg className="size-4 fill-current" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.67a6.34 6.34 0 0 0 10.86 4.49v-9a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.09l.96-2.5Z" />
  </svg>
)

const SOCIAL_LINKS = [
  { id: 'linkedin', label: 'LinkedIn', href: '#', icon: LinkedinIcon },
  { id: 'instagram', label: 'Instagram', href: '#', icon: InstagramIcon },
  { id: 'youtube', label: 'YouTube', href: '#', icon: YoutubeIcon },
  { id: 'twitter', label: 'Twitter / X', href: '#', icon: TwitterIcon },
  { id: 'tiktok', label: 'TikTok', href: '#', icon: TiktokIcon },
]

const Footer = () => {
  const currentYear = 2026

  return (
    <footer className="relative z-20 mx-auto w-full max-w-7xl px-4 pb-8 pt-16">
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-900/60 to-purple-950/90 p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(147,51,234,0.2)] md:p-12">
        <div className="flex flex-col items-center justify-center">
          <Link href="/" aria-label="Beranda ISAC 2026">
            <img
              src={IMAGES.logo}
              alt="Information Systems Airlangga Competition 2026"
              className="w-48 md:w-64 h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
          </Link>
        </div>

        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-white/70 md:flex-row md:text-sm md:text-left">
          <p>
            &copy; Copyright Information Systems Airlangga Competition {currentYear}{' '}
            All Rights Reserved
          </p>
          <a
            href="#privacy-policy"
            className="underline hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-all hover:border-purple-400 hover:bg-purple-600/30 hover:text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                >
                  <Icon />
                </a>
              )
            })}
          </div>

          <p className="text-xs text-white/70 md:text-sm">
            Presented by: <span className="font-semibold text-white">HIMSI UNAIR</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer