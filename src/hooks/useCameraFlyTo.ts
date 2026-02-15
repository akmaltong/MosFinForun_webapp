import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export function useCameraFlyTo(targetPosition: [number, number, number] | null, distance: number = 20) {
  const { camera, controls } = useThree()

  useEffect(() => {
    if (!targetPosition || !controls) return

    const orbitControls = controls as any

    // Calculate camera position (offset from target)
    const offset = new THREE.Vector3(distance, distance * 0.8, distance)
    const targetVec = new THREE.Vector3(...targetPosition)
    const cameraTargetPos = targetVec.clone().add(offset)

    // Animate camera position
    const startPos = camera.position.clone()
    const startTarget = orbitControls.target ? orbitControls.target.clone() : targetVec.clone()

    const startTime = Date.now()
    const duration = 1500 // 1.5 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      // Interpolate camera position
      camera.position.lerpVectors(startPos, cameraTargetPos, eased)

      // Interpolate controls target
      if (orbitControls.target) {
        orbitControls.target.lerpVectors(startTarget, targetVec, eased)
        orbitControls.update()
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [targetPosition, camera, controls, distance])
}
