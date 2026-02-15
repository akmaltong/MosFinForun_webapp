import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function NavMeshVisualizer() {
  const [visible, setVisible] = useState(false)
  
  // Load the navmesh GLB
  const { scene } = useGLTF('Navmesh.glb')
  
  useEffect(() => {
    // Find the mesh in the loaded scene
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create red wireframe material
        child.material = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: false,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        })
      }
    })
  }, [scene])

  if (!visible) return null

  return (
    <primitive object={scene} />
  )
}
