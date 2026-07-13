import { REGISTRATION_STEPS } from '@/constants/registration'
import { cn } from '@/lib/utils'
import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)



const Steps = () => {
  const [currentStep, setCurrentStep] = React.useState(1)

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
        const active = currentStep >= index

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
    <div ref={containerRef} className='flex gap-4 items-center justify-center'>
      {REGISTRATION_STEPS.map((step, index) => (
        <div key={index} className='flex items-center gap-4'>
          <div
            className={cn(
              'flex flex-col items-center gap-4 text-gray-400',
              currentStep >= index && 'text-primary-foreground'
            )}
          >
            <div
              onClick={() => setCurrentStep(index)}
              ref={(el) => {
                circleRefs.current[index] = el
              }}
              className={cn(
                'p-8 border-4 border-gray-400 rounded-full transition-colors duration-300 cursor-pointer',
                currentStep >= index && 'border-primary-foreground bg-primary shadow-2xl shadow-white'
              )}
            >
              {step.icon && <step.icon size={24} />}
            </div>
            <div>{step.name}</div>
          </div>

          {index !== 4 && (
            <div
              ref={(el) => {
                lineRefs.current[index] = el
              }}
              className={cn(
                'w-16 h-1 font-bold md:text-xl bg-gray-300 mb-8 border-4 border-gray-400 rounded-full transition-colors duration-300',
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