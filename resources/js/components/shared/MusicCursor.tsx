import { createPortal } from 'react-dom'
import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface CursorState {
  isHoveringButton: boolean
  isHoveringText: boolean
  isHoveringLink: boolean
  isHoveringInput: boolean
  isClicking: boolean
}

const MusicCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const soundGroupRef = useRef<SVGGElement>(null)
  const [cursorState, setCursorState] = useState<CursorState>({
    isHoveringButton: false,
    isHoveringText: false,
    isHoveringLink: false,
    isHoveringInput: false,
    isClicking: false,
  })

  // Gunakan ref untuk posisi agar tidak re-render
  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })
  const dotPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = cursorDotRef.current
    if (!cursor || !dot) return

    let rafId: number

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX
      mousePos.current.y = e.clientY
    }

    const animate = () => {
      // Lerp untuk cursor (laggy effect)
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.12
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.12

      // Dot mengikuti langsung tapi sedikit smooth
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.5
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.5

      // Gunakan translate3d untuk GPU acceleration, HAPUS left/top
      cursor.style.transform = `translate3d(${cursorPos.current.x}px, ${cursorPos.current.y}px, 0) translate(-50%, -50%)`
      dot.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`

      rafId = requestAnimationFrame(animate)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isButton = target.closest('button, [role="button"], .btn, input[type="submit"]')
      const isLink = target.closest('a, [role="link"]')
      const isText = target.closest('p, span, h1, h2, h3, h4, h5, h6, label, .text-hover')
      const isInput = target.closest('input, textarea, select, [contenteditable="true"]')

      setCursorState(prev => ({
        ...prev,
        isHoveringButton: !!isButton,
        isHoveringLink: !!isLink,
        isHoveringText: !!isText && !isButton && !isLink && !isInput,
        isHoveringInput: !!isInput,
      }))
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const relatedTarget = e.relatedTarget as HTMLElement | null

      if (!relatedTarget || !target.contains(relatedTarget)) {
        setCursorState(prev => ({
          ...prev,
          isHoveringButton: false,
          isHoveringLink: false,
          isHoveringText: false,
          isHoveringInput: false,
        }))
      }
    }

    const handleMouseDown = () => {
      setCursorState(prev => ({ ...prev, isClicking: true }))
    }

    const handleMouseUp = () => {
      setCursorState(prev => ({ ...prev, isClicking: false }))
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseout', handleMouseOut, { passive: true })
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = cursorDotRef.current
    const soundGroup = soundGroupRef.current
    if (!cursor || !dot) return

    // Kill previous tweens agar tidak numpuk
    gsap.killTweensOf([cursor, dot, soundGroup])

    if (cursorState.isHoveringButton) {
      gsap.to(cursor, {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
        borderColor: '#A78BFA',
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 0.5,
        backgroundColor: '#FACC15',
        duration: 0.3,
        ease: 'power2.out',
      })
      if (soundGroup) {
        gsap.to(soundGroup, {
          opacity: 0,
          scale: 0.5,
          duration: 0.2,
          ease: 'power2.out',
        })
      }
    } else if (cursorState.isHoveringLink) {
      gsap.to(cursor, {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(250, 204, 8, 0.15)',
        borderColor: '#FACC15',
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 0.6,
        backgroundColor: '#A78BFA',
        duration: 0.3,
        ease: 'power2.out',
      })
      if (soundGroup) {
        gsap.to(soundGroup, {
          opacity: 0,
          scale: 0.5,
          duration: 0.2,
          ease: 'power2.out',
        })
      }
    } else if (cursorState.isHoveringText) {
      gsap.to(cursor, {
        width: 80,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderColor: 'rgba(167, 139, 250, 0.5)',
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 0.3,
        backgroundColor: '#A78BFA',
        duration: 0.3,
        ease: 'power2.out',
      })
      if (soundGroup) {
        gsap.to(soundGroup, {
          opacity: 0,
          scale: 0.5,
          duration: 0.2,
          ease: 'power2.out',
        })
      }
    } else if (cursorState.isHoveringInput) {
      gsap.to(cursor, {
        width: 4,
        height: 35,
        borderRadius: 2,
        backgroundColor: '#A78BFA',
        borderColor: 'transparent',
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 0,
        duration: 0.2,
      })
      if (soundGroup) {
        gsap.to(soundGroup, {
          opacity: 0,
          scale: 0.5,
          duration: 0.2,
          ease: 'power2.out',
        })
      }
    } else {
      gsap.to(cursor, {
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 1,
        backgroundColor: 'transparent',
        duration: 0.3,
        ease: 'power2.out',
      })
      if (soundGroup) {
        gsap.to(soundGroup, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    if (cursorState.isClicking) {
      gsap.to(cursor, {
        scale: 0.8,
        duration: 0.1,
        ease: 'power2.out',
      })
    } else {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.2,
        ease: 'elastic.out(1, 0.5)',
      })
    }
  }, [cursorState])

  useEffect(() => {
    const soundGroup = soundGroupRef.current
    if (!soundGroup) return

    // Kill previous timeline
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(soundGroup, {
      y: -6,
      rotation: 5,
      duration: 2.2,
      ease: 'sine.inOut',
      transformOrigin: 'center center',
    })

    return () => {
      tl.kill()
    }
  }, [])

  const isDefault = !cursorState.isHoveringButton && !cursorState.isHoveringLink && !cursorState.isHoveringText && !cursorState.isHoveringInput

  return createPortal(
    <>
      <style>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
        @media (pointer: coarse) {
          .music-cursor,
          .music-cursor-dot {
            display: none !important;
          }
        }
      `}</style>

      <div
        ref={cursorRef}
        className="music-cursor fixed pointer-events-none z-[9999] flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid transparent',
          backgroundColor: 'transparent',
          willChange: 'transform',
          top: 0,
          left: 0,
          // HAPUS marginTop/marginLeft, gunakan translate(-50%, -50%) di transform
        }}
      >
        {cursorState.isHoveringText && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A78BFA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
        {cursorState.isHoveringButton && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FACC15"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
        {isDefault && (
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
          >
            <g ref={soundGroupRef} style={{ transformOrigin: 'center center' }}>
              <ellipse cx="10" cy="38" rx="5" ry="4" fill="hsl(var(--primary))" />
              <ellipse cx="28" cy="34" rx="5" ry="4" fill="hsl(var(--primary))" />
              <path
                d="M15 38V14L33 10V34"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M15 14L33 10"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        )}
      </div>

      <div
        ref={cursorDotRef}
        className="music-cursor-dot fixed pointer-events-none z-[9999]"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          willChange: 'transform',
          top: 0,
          left: 0,
          // HAPUS marginTop/marginLeft
        }}
      />
    </>,
    document.body
  )
}

export default MusicCursor