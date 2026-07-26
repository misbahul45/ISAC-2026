import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQ_ITEMS } from '@/constants/faq'

export function Faq() {
  const [openId, setOpenId] = useState<string | null>('faq-1')

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="faq" className="relative overflow-hidden px-4 py-24 z-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <h2 className="flex flex-col text-4xl font-extrabold tracking-wide md:text-5xl">
              <span className="text-white text-shadow-[0_0_12px_#fff]">
                Frequently Asked
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]">
                Questions
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-7">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 cursor-pointer',
                    isOpen
                      ? 'border-purple-400/80 bg-purple-900/50 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                      : 'border-purple-500/30 bg-purple-950/40 hover:border-purple-400/60',
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-white md:text-lg">
                      {item.question}
                    </h3>
                    <div className="shrink-0 text-white/80">
                      {isOpen ? (
                        <ChevronUp className="size-6" />
                      ) : (
                        <ChevronDown className="size-6" />
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
                      {item.answer}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
