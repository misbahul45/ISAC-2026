import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

type Sound1Props = {
  className?: string
}

const Sound1 = ({ className }: Sound1Props) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(
    () => {
      const group = gsap.utils.toArray<SVGGElement>('.sound-group')[0]

      if (!group) return

      gsap.to(group, {
        y: -8,
        rotation: 5,
        duration: 2.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: 'center center',
      })
    },
    { scope: svgRef }
  )

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g className="sound-group">
        <ellipse cx="10" cy="38" rx="5" ry="4" fill="#EAB308" />
        <ellipse cx="28" cy="34" rx="5" ry="4" fill="#EAB308" />
        <path
          d="M15 38V14L33 10V34"
          stroke="#EAB308"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M15 14L33 10"
          stroke="#EAB308"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}

export default Sound1