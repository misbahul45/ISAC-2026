import { getRegistrationSteps } from '@/constants/registration'
import { cn } from '@/lib/utils'
import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Link, usePage } from '@inertiajs/react'
import { useRegistrationContext } from '../hooks/useRegistration'

gsap.registerPlugin(useGSAP)

const getStepPath = (index: number, name: string) =>
  index === 0 ? '/registration' : `/registration/${name.toLowerCase()}`

const Steps = () => {
  const { url } = usePage()
  const contextQuery = useRegistrationContext()
  const isOlympiad =
    contextQuery.data?.data.registration?.competition.type === 'OLIMPIADE'
  const registrationSteps = getRegistrationSteps(isOlympiad)
  const pathname = url.split('?')[0]

  const rawStep = registrationSteps.findIndex((step, index) => pathname === getStepPath(index, step.name))
  const currentStep = rawStep === -1 ? 0 : rawStep
  const furthestAvailableStep = registrationSteps.findIndex(
    (step, index) => contextQuery.data?.data.redirectTo === getStepPath(index, step.name),
  )
  const lastAccessibleStep = Math.max(currentStep, furthestAvailableStep)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const circleRefs = useRef<(HTMLDivElement | null)[]>([])
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const hasMounted = useRef(false)

  useGSAP(
    () => {
      gsap.from(circleRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      })

      gsap.from(lineRefs.current, {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 0.5,
        stagger: 0.15,
        delay: 0.2,
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

      registrationSteps.forEach((step, index) => {
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
    { scope: containerRef, dependencies: [currentStep, isOlympiad] }
  )

  return (
    <div ref={containerRef} className='flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 items-center justify-center z-50'>
      {registrationSteps.map((step, index) => {
        const isAccessible = index <= lastAccessibleStep

        return (
        <div key={index} className='flex items-center gap-2 sm:gap-3 md:gap-4'>
          <div
            className={cn(
              'flex flex-col items-center gap-2 sm:gap-3 md:gap-4 text-gray-400',
              currentStep >= index && 'text-primary-foreground'
            )}
          >
            <Link
              href={getStepPath(index, step.name)}
              onClick={(event) => {
                if (!isAccessible) event.preventDefault()
              }}
              aria-disabled={!isAccessible}
              className={cn(
                'flex items-center justify-center',
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
            >
              <div
                ref={(el) => {
                  circleRefs.current[index] = el
                }}
                className={cn(
                  'relative flex items-center justify-center p-2 sm:p-3 md:p-5 lg:p-7 border sm:border-2 md:border-4 border-gray-400 rounded-full transition-colors duration-300',
                  currentStep >= index && 'border-primary-foreground bg-primary shadow-[0_0_30px_-5px_rgba(139,92,255,0.6)]'
                )}
                style={{
                  transform: 'perspective(500px) rotateX(10deg)',
                  boxShadow: currentStep >= index 
                    ? '0 8px 20px rgba(139,92,255,0.4), 0 0 30px rgba(139,92,255,0.2), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)'
                    : '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {step.icon && <step.icon className='size-2 sm:size-3 md:size-4 lg:size-5 relative z-10' />}
                
                <div 
                  className='absolute inset-0 rounded-full'
                  style={{
                    background: currentStep >= index
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.3) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </Link>
            <div className='text-[10px] sm:text-sm md:text-base lg:text-xl font-semibold md:font-bold'>{step.name}</div>
          </div>

          {index !== registrationSteps.length - 1 && (
            <div
              ref={(el) => {
                lineRefs.current[index] = el
              }}
              className={cn(
                'relative w-5 sm:w-10 md:w-12 lg:w-16 h-1.5 sm:h-2 md:h-3 bg-gray-400 rounded-full transition-colors duration-300',
                currentStep > index && 'bg-secondary'
              )}
              style={{
                transform: 'perspective(300px) rotateX(15deg)',
                boxShadow: currentStep > index
                  ? '0 4px 8px rgba(45,226,230,0.4), 0 0 15px rgba(45,226,230,0.2), inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.2)'
                  : '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.2)',
              }}
            >
              <div 
                className='absolute inset-0 rounded-full'
                style={{
                  background: currentStep > index
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}
        </div>
        )
      })}
    </div>
  )
}

export default Steps
