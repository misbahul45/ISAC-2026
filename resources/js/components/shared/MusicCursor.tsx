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
  const [cursorState, setCursorState] = useState<CursorState>({
    isHoveringButton: false,
    isHoveringText: false,
    isHoveringLink: false,
    isHoveringInput: false,
    isClicking: false,
  })

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = cursorDotRef.current
    if (!cursor || !dot) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15
      cursorY += (mouseY - cursorY) * 0.15

      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`

      requestAnimationFrame(animate)
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
      const relatedTarget = e.relatedTarget as HTMLElement

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

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    const animFrame = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      cancelAnimationFrame(animFrame)
    }
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = cursorDotRef.current
    if (!cursor || !dot) return

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
    } else {
      gsap.to(cursor, {
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: 'transparent',
        borderColor: '#A78BFA',
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.to(dot, {
        scale: 1,
        backgroundColor: '#FACC15',
        duration: 0.3,
        ease: 'power2.out',
      })
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

  return (
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
        className="music-cursor fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid #A78BFA',
          backgroundColor: 'transparent',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      >
        {cursorState.isHoveringText && (
          <div className="absolute inset-0 flex items-center justify-center">
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
          </div>
        )}
        {cursorState.isHoveringButton && (
          <div className="absolute inset-0 flex items-center justify-center">
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
          </div>
        )}
      </div>

      <div
        ref={cursorDotRef}
        className="music-cursor-dot fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#FACC15',
          boxShadow: '0 0 10px rgba(250, 204, 8, 0.5), 0 0 20px rgba(250, 204, 8, 0.3)',
          willChange: 'transform',
        }}
      />
    </>
  )
}

export default MusicCursor