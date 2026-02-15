import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useAppStore } from '../store/appStore'
import * as THREE from 'three'

let orbitControlsRef: any = null

export function setOrbitControls(controls: any) {
  orbitControlsRef = controls
}

// Overview camera position and target (perspective angle view)
const OVERVIEW_CAMERA_POS: [number, number, number] = [-66, 241, 6]
const OVERVIEW_LOOK_AT: [number, number, number] = [-41, -7, 6]

export default function CameraController() {
  const { camera } = useThree()
  const cameraTarget = useAppStore(state => state.cameraTarget)
  const setCameraTarget = useAppStore(state => state.setCameraTarget)
  const resetCameraToOverview = useAppStore(state => state.resetCameraToOverview)
  const setResetCameraToOverview = useAppStore(state => state.setResetCameraToOverview)
  const zones = useAppStore(state => state.zones)
  const animationRef = useRef<number | null>(null)
  const startPosRef = useRef<THREE.Vector3 | null>(null)
  const startTargetRef = useRef<THREE.Vector3 | null>(null)

  // Handle overview reset animation
  useEffect(() => {
    if (!resetCameraToOverview) return

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const targetCamPos = new THREE.Vector3(...OVERVIEW_CAMERA_POS)
    const targetLookAt = new THREE.Vector3(...OVERVIEW_LOOK_AT)

    startPosRef.current = camera.position.clone()
    startTargetRef.current = orbitControlsRef?.target?.clone() || new THREE.Vector3(0, 10, 0)

    const startTime = Date.now()
    const duration = 1500

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      if (startPosRef.current) {
        camera.position.lerpVectors(startPosRef.current, targetCamPos, eased)

        if (orbitControlsRef && orbitControlsRef.target) {
          orbitControlsRef.target.lerpVectors(startTargetRef.current!, targetLookAt, eased)
          orbitControlsRef.update()
        } else {
          camera.lookAt(targetLookAt)
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setResetCameraToOverview(false)
        animationRef.current = null
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [resetCameraToOverview, camera, setResetCameraToOverview])

  // Handle zone camera target animation
  useEffect(() => {
    if (!cameraTarget || typeof cameraTarget !== 'string') {
      return
    }

    const zone = zones.find(z => z.id === cameraTarget)

    if (!zone) {
      setCameraTarget(null)
      return
    }

    const poi = zone?.poi

    if (!poi || !poi.cameraPosition || !poi.targetPosition) {
      setCameraTarget(null)
      return
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    startPosRef.current = camera.position.clone()
    startTargetRef.current = orbitControlsRef?.target?.clone() || new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)

    const startTime = Date.now()
    const duration = 2000

    // Determine if we are in top-down mode
    const isTopDown = useAppStore.getState().viewMode === 'top'

    let targetCamPos: THREE.Vector3
    let targetLookAt: THREE.Vector3

    if (isTopDown) {
      targetLookAt = new THREE.Vector3(...poi.targetPosition)
      const currentTarget = orbitControlsRef?.target || new THREE.Vector3(0, 0, 0)
      const delta = new THREE.Vector3().subVectors(targetLookAt, currentTarget)
      targetCamPos = camera.position.clone().add(delta)
    } else {
      targetCamPos = new THREE.Vector3(...poi.cameraPosition)
      targetLookAt = new THREE.Vector3(...poi.targetPosition)
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      if (startPosRef.current) {
        camera.position.lerpVectors(startPosRef.current, targetCamPos, eased)

        if (orbitControlsRef && orbitControlsRef.target) {
          orbitControlsRef.target.lerpVectors(startTargetRef.current!, targetLookAt, eased)
          orbitControlsRef.update()
        } else {
          camera.lookAt(targetLookAt)
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCameraTarget(null)
        animationRef.current = null
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [cameraTarget, camera, setCameraTarget, zones])

  return null
}
