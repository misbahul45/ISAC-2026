import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

type Sound3Props = {
  className?: string
}

const Sound3 = ({ className }: Sound3Props) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    if (!svgRef.current) return
    const group = svgRef.current.querySelector('.sound-group')

    gsap.to(group, {
      y: -10,
      rotation: 8,
      duration: 3.0,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 0.8,
      transformOrigin: 'center center',
    })
  }, { scope: svgRef })

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g className="sound-group">
        <ellipse cx="10" cy="38" rx="5" ry="4" fill="#34D399" />
        <ellipse cx="28" cy="34" rx="5" ry="4" fill="#34D399" />
        <path
          d="M15 38V14L33 10V34"
          stroke="#34D399"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M15 14L33 10"
          stroke="#34D399"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Sound wave effect */}
        <path
          d="M36 16C38 18 38 26 36 28"
          stroke="#34D399"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M40 12C44 16 44 28 40 32"
          stroke="#34D399"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </g>
    </svg>
  )
}

export default Sound3