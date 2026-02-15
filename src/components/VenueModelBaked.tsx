import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'
import { initCollisionDetection } from '../utils/collisionDetection'

/**
 * VenueModel с встроенными текстурами из GLB
 * Использует только текстуры которые уже есть в модели SM_MFF.2.glb
 */

function LoadedModel() {
  const gltf = useGLTF('/SM_MFF.glb')
  const { scene } = gltf
  
  const materialColor = useAppStore(state => state.materialColor)
  const materialRoughness = useAppStore(state => state.materialRoughness)
  const materialMetalness = useAppStore(state => state.materialMetalness)
  const aoIntensity = useAppStore(state => state.aoIntensity)
  const envMapIntensity = useAppStore(state => state.envMapIntensity)

  // Инициализация системы коллизий при загрузке модели
  useEffect(() => {
    if (gltf?.scene) {
      initCollisionDetection(gltf.scene)
    }
  }, [gltf])

  useEffect(() => {
    if (!gltf?.scene) return
    
    gltf.scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mat = child.material
        
        // AO Intensity
        if (mat.aoMap) {
          mat.aoMapIntensity = aoIntensity
        }
        
        // Основные параметры материала
        mat.color = new THREE.Color(materialColor)
        mat.roughness = materialRoughness
        mat.metalness = materialMetalness
        mat.envMapIntensity = envMapIntensity
        
        // UV2 для AO
        if (child.geometry.attributes.uv && !child.geometry.attributes.uv2) {
          child.geometry.attributes.uv2 = child.geometry.attributes.uv
        }
        
        // Тени отключены
        child.castShadow = false
        child.receiveShadow = false
        
        mat.needsUpdate = true
      }
    })
  }, [gltf, materialColor, materialRoughness, materialMetalness, aoIntensity, envMapIntensity])

  return <primitive object={scene} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
}

export default function VenueModelBaked() {
  return <LoadedModel />
}
