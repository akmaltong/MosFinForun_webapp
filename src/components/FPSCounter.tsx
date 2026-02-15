import { useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function FPSCounter() {
  const [fps, setFps] = useState(60)
  
  useFrame((state) => {
    // Calculate FPS from delta time
    const currentFps = Math.round(1 / state.clock.getDelta())
    setFps(currentFps)
  })

  return null // This component doesn't render anything in the DOM
}

// Separate component for displaying FPS in UI
export function FPSDisplay() {
  const [fps, setFps] = useState(60)
  const [frameCount, setFrameCount] = useState(0)
  const [lastTime, setLastTime] = useState(performance.now())

  useEffect(() => {
    let animationFrameId: number

    const updateFPS = () => {
      const now = performance.now()
      setFrameCount(prev => prev + 1)

      // Update FPS every second
      if (now >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)))
        setFrameCount(0)
        setLastTime(now)
      }

      animationFrameId = requestAnimationFrame(updateFPS)
    }

    animationFrameId = requestAnimationFrame(updateFPS)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [frameCount, lastTime])

  // Color based on FPS
  const getColor = () => {
    if (fps >= 50) return '#4ade80' // green
    if (fps >= 30) return '#fbbf24' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="text-[9px] font-mono tracking-wide" style={{ color: getColor() }}>
      FPS: {fps}
    </div>
  )
}
