import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

export function useCameraType() {
  const { camera } = useThree()
  
  const isOrthographic = useMemo(() => {
    return camera instanceof THREE.OrthographicCamera
  }, [camera])
  
  return {
    isOrthographic,
    isPerspective: !isOrthographic
  }
}