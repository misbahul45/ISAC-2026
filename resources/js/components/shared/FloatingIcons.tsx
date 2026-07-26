import { useEffect, useState, type CSSProperties } from 'react'
import Sound1 from '@/components/shared/Sound1'
import Sound2 from '@/components/shared/Sound2'
import Sound3 from '@/components/shared/Sound3'
import Sound4 from '@/components/shared/Sound4'
import {
  resolveResponsiveDistance,
  type FloatingIconConfig,
  type FloatingIconVisibility,
} from '@/constants/auth'

const VISIBILITY_CLASSES: Record<FloatingIconVisibility, string> = {
  base: 'block',
  sm: 'hidden sm:block',
  md: 'hidden md:block',
}

function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState(0)

  useEffect(() => {
    let animationFrame = 0
    const update = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => setViewportWidth(window.innerWidth))
    }
    update()
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', update)
    }
  }, [])

  return viewportWidth
}

const FloatingIcon = ({
  config,
  viewportWidth,
}: {
  config: FloatingIconConfig
  viewportWidth: number
}) => {
  const { component, angle, size, opacity, delay, phase, speed, orbitSpeed, showFrom } = config

  const distance = resolveResponsiveDistance(config.distance, viewportWidth)
  const radian = (angle * Math.PI) / 180
  const x = Math.cos(radian) * distance
  const y = Math.sin(radian) * distance

  const wrapperStyle: CSSProperties = {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    opacity,
  }

  const iconClass = `${size} animate-[floatNote_${speed}s_ease-in-out_infinite]`
  const orbitDelay = delay + phase
  const visibilityDelay = delay + phase * 1.5

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 ${VISIBILITY_CLASSES[showFrom]}`}
      style={wrapperStyle}
    >
      <div
        className="scale-75 rounded-xl border border-primary/20 bg-primary/10 p-2 shadow-lg shadow-primary/10 backdrop-blur-md sm:scale-90 sm:rounded-2xl sm:p-2.5 lg:scale-100 lg:p-3"
        style={{
          animation: `soundOrbit ${orbitSpeed}s ease-in-out infinite, soundVisibility 8s ease-in-out infinite`,
          animationDelay: `${orbitDelay}s, ${visibilityDelay}s`,
        }}
      >
        {component === 'sound1' && <Sound1 className={iconClass} />}
        {component === 'sound2' && <Sound2 className={iconClass} />}
        {component === 'sound3' && <Sound3 className={iconClass} />}
        {component === 'sound4' && <Sound4 className={iconClass} />}
      </div>
    </div>
  )
}

export function FloatingIcons({ config }: { config: FloatingIconConfig[] }) {
  const viewportWidth = useViewportWidth()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {config.map((icon, index) => (
        <FloatingIcon key={`${icon.component}-${index}`} config={icon} viewportWidth={viewportWidth} />
      ))}
    </div>
  )
}
