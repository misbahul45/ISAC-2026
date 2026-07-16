import { REGISTRATION_STEPS } from '@/constants/registration'
import { cn } from '@/lib/utils'
import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Link, usePage } from '@inertiajs/react'

gsap.registerPlugin(useGSAP)

const getStepPath = (index: number, name: string) =>
  index === 0 ? '/registration' : `/registration/${name.toLowerCase()}`

const Steps = () => {
  const { url } = usePage()
  const pathname = url.split('?')[0]

  const rawStep = REGISTRATION_STEPS.findIndex((step, index) => pathname === getStepPath(index, step.name))
  const currentStep = rawStep === -1 ? 0 : rawStep

  const containerRef = useRef<HTMLDivElement | null>(null)
  const circleRefs = useRef<(HTMLDivElement | null)[]>([])
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const hasMounted = useRef(false)

  useGSAP(
    () => {
      gsap.from(circleRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      })

      gsap.from(lineRefs.current, {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 0.4,
        stagger: 0.15,
        delay: 0.15,
        ease: 'power2.out',
        onComplete: () => {
          hasMounted.current = true
        },
      })
    },
    { scope: containerRef }
  )

  useGSAP(
    () => {
      if (!hasMounted.current) return

      REGISTRATION_STEPS.forEach((step, index) => {
        const circle = circleRefs.current[index]
        if (circle) {
          gsap.to(circle, {
            scale: currentStep === index ? 1.1 : 1,
            duration: 0.4,
            ease: 'elastic.out(1, 0.6)',
            overwrite: 'auto',
          })
        }
      })
    },
    { scope: containerRef, dependencies: [currentStep] }
  )

  return (
    <div ref={containerRef} className='flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 items-center justify-center'>
      {REGISTRATION_STEPS.map((step, index) => (
        <div key={index} className='flex items-center gap-2 sm:gap-3 md:gap-4'>
          <div
            className={cn(
              'flex flex-col items-center gap-2 sm:gap-3 md:gap-4 text-gray-400',
              currentStep >= index && 'text-primary-foreground'
            )}
          >
            <Link
              href={getStepPath(index, step.name)}
              onClick={(e) => {
                if (currentStep < index) {
                  e.preventDefault()
                }
              }}
              className={cn(
                'flex items-center justify-center',
                currentStep >= index ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
            >
              <div
                ref={(el) => {
                  circleRefs.current[index] = el
                }}
                className={cn(
                  'p-2 sm:p-3 md:p-5 lg:p-7 border sm:border-2 md:border-4 border-gray-400 rounded-full transition-colors duration-300',
                  currentStep >= index && 'border-primary-foreground bg-primary shadow-lg md:shadow-2xl shadow-white'
                )}
              >
                {step.icon && <step.icon className='size-2 sm:size-3 md:size-4 lg:size-5' />}
              </div>
            </Link>
            <div className='text-[10px] sm:text-sm md:text-base lg:text-xl font-font-semibold md:font-bold'>{step.name}</div>
          </div>

          {index !== REGISTRATION_STEPS.length - 1 && (
            <div
              ref={(el) => {
                lineRefs.current[index] = el
              }}
              className={cn(
                'w-5 sm:w-10 md:w-12 lg:w-16 h-0.5 sm:h-1 bg-gray-300 mb-4 sm:mb-6 md:mb-8 border-2 md:border-4 border-gray-400 rounded-full transition-colors duration-300',
                currentStep > index && 'bg-secondary border-secondary'
              )}
            ></div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Steps