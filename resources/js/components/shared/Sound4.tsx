import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

type Sound4Props = {
  className?: string
}

const Sound4 = ({ className }: Sound4Props) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    if (!svgRef.current) return
    const group = svgRef.current.querySelector('.sound-group')

    gsap.to(group, {
      y: -6,
      rotation: -8,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1.2,
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
        <ellipse cx="10" cy="38" rx="5" ry="4" fill="#F472B6" />
        <ellipse cx="28" cy="34" rx="5" ry="4" fill="#F472B6" />
        <path
          d="M15 38V14L33 10V34"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M15 14L33 10"
          stroke="#F472B6"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Additional decorative circle */}
        <circle cx="38" cy="20" r="3" fill="#F472B6" opacity="0.5" />
        <circle cx="42" cy="24" r="2" fill="#F472B6" opacity="0.3" />
      </g>
    </svg>
  )
}

export default Sound4