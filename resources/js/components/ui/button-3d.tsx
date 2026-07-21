import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Link } from '@inertiajs/react'

const getThemeColor = (varName: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return value || fallback
}

type Button3DVariant = 'solid' | 'ghost'
type Button3DSize = 'xs' | 'sm' | 'default' | 'lg'

interface Button3DProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: Button3DVariant
  size?: Button3DSize
  disabled?: boolean
  className?: string
}

const sizeClasses: Record<Button3DSize, string> = {
  xs: 'py-1.5 px-3 min-w-20 text-xs',
  sm: 'py-2 px-4 md:px-5 min-w-22.5 text-xs',
  default: 'py-2.5 px-6 md:px-8 min-w-27.5 text-sm',
  lg: 'py-3 px-7 md:px-9 min-w-32.5 text-sm',
}

const variantFillClasses: Record<Button3DVariant, string> = {
  solid: 'bg-primary',
  ghost: 'bg-card',
}

const MESH_OVERSCAN = 1.6

const Button3D = ({
  children,
  onClick,
  href,
  variant = 'solid',
  size = 'default',
  disabled = false,
  className = '',
}: Button3DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hoverRef = useRef(0)
  const pressRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const geometry = new THREE.BoxGeometry(3.4, 1.1, 0.4, 1, 1, 1)
    const fillColor = variant === 'solid'
      ? getThemeColor('--primary', '#8B5CFF')
      : getThemeColor('--card', '#171B3B')
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(fillColor),
      roughness: 0.4,
      metalness: 0.15,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambient)

    const key = new THREE.DirectionalLight(0xffffff, 1.1)
    key.position.set(2, 3, 4)
    scene.add(key)

    const fillLight = new THREE.DirectionalLight(
      new THREE.Color(getThemeColor('--secondary', '#2DE2E6')),
      0.5
    )
    fillLight.position.set(-3, -2, 2)
    scene.add(fillLight)

    const fitMeshToView = () => {
      const frontFaceZ = mesh.position.z + 0.2
      const distance = camera.position.z - frontFaceZ
      const vFov = (camera.fov * Math.PI) / 180
      const viewHeight = 2 * Math.tan(vFov / 2) * distance
      const viewWidth = viewHeight * camera.aspect
      mesh.scale.x = (viewWidth / 3.4) * MESH_OVERSCAN
      mesh.scale.y = (viewHeight / 1.1) * MESH_OVERSCAN
    }

    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      fitMeshToView()
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(wrap)

    let frameId = 0
    const animate = () => {
      const hoverTarget = wrap.dataset.hover === 'true' ? 1 : 0
      const pressTarget = wrap.dataset.press === 'true' ? 1 : 0
      hoverRef.current += (hoverTarget - hoverRef.current) * 0.1
      pressRef.current += (pressTarget - pressRef.current) * 0.3

      mesh.rotation.x = hoverRef.current * 0.12
      mesh.rotation.y = hoverRef.current * 0.22
      mesh.position.z = pressRef.current * -0.25
      mesh.scale.z = 1 - pressRef.current * 0.04

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [variant])

  const textColor = variant === 'solid' ? 'text-primary-foreground' : 'text-foreground'
  const fillClass = variantFillClasses[variant]

  const innerClassName = `button3d-inner relative flex items-center justify-center rounded-[inherit] w-full h-full overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:border-ring disabled:pointer-events-none ${fillClass} ${sizeClasses[size]}`

  const innerContent = (
    <>
      <canvas ref={canvasRef} className='absolute inset-0 w-full h-full' />
      <span className={`relative z-10 font-medium whitespace-nowrap ${textColor}`}>
        {children}
      </span>
    </>
  )

  return (
    <div
      ref={wrapRef}
      data-hover='false'
      data-press='false'
      onMouseEnter={(e) => !disabled && (e.currentTarget.dataset.hover = 'true')}
      onMouseLeave={(e) => {
        e.currentTarget.dataset.hover = 'false'
        e.currentTarget.dataset.press = 'false'
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.dataset.press = 'true')}
      onMouseUp={(e) => (e.currentTarget.dataset.press = 'false')}
      className={`button3d-wrap relative inline-block rounded-4xl transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <span className={`button3d-spin ${variant === 'ghost' ? 'is-ghost' : ''}`} aria-hidden='true' />

      {href && !disabled ? (
        <Link href={href} className={innerClassName}>
          {innerContent}
        </Link>
      ) : (
        <button onClick={onClick} disabled={disabled} className={innerClassName}>
          {innerContent}
        </button>
      )}
    </div>
  )
}

export default Button3D