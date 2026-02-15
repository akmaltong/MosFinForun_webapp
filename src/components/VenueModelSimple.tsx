import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'

/**
 * VenueModel с встроенными текстурами из GLB
 * Использует материалы которые уже есть в модели
 */

function LoadedModel() {
  const gltf = useGLTF('/SM_MFF.glb')
  const { scene } = gltf
  
  // Контроль AO через Leva
  const { aoIntensity, lightmapIntensity, envMapIntensity } = useControls('Baked Textures', {
    aoIntensity: { value: 2.5, min: 0, max: 5, step: 0.1, label: 'AO Intensity' },
    lightmapIntensity: { value: 1.0, min: 0, max: 3, step: 0.1, label: 'Lightmap Intensity' },
    envMapIntensity: { value: 1.2, min: 0, max: 3, step: 0.1, label: 'Env Map Intensity' },
  })
  
  useEffect(() => {
    if (!gltf?.scene) return
    
    // Настраиваем материалы и тени
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Включаем тени
        child.castShadow = true
        child.receiveShadow = true
        
        // Настраиваем материал если он есть
        if (child.material) {
          // Усиливаем AO если карта есть
          if (child.material.aoMap) {
            child.material.aoMapIntensity = aoIntensity
            console.log('✅ AO map found, intensity:', aoIntensity)
          }
          
          // Усиливаем lightmap если есть
          if (child.material.lightMap) {
            child.material.lightMapIntensity = lightmapIntensity
            console.log('✅ Lightmap found, intensity:', lightmapIntensity)
          }
          
          // Настраиваем environment map
          child.material.envMapIntensity = envMapIntensity
          
          // Обновляем материал
          child.material.needsUpdate = true
        }
      }
    })
  }, [gltf, aoIntensity, lightmapIntensity, envMapIntensity])
  
  return <primitive object={scene} />
}

export default function VenueModelSimple() {
  return <LoadedModel />
}
