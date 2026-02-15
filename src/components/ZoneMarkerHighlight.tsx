import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  color: string
}

export default function ZoneMarkerHighlight({ position, color }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      meshRef.current.scale.set(scale, 1, scale)
    }
  })
  
  return (
    <mesh ref={meshRef} position={[position[0], position[1] + 2, position[2]]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.8}
      />
    </mesh>
  )
}
