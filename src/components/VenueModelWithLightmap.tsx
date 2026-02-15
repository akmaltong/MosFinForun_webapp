import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'
import { useControls } from 'leva'

/**
 * VenueModel с правильным HDR Lightmap
 * Использует EXRLoader для загрузки 32-bit Float lightmap
 */

function LoadedModel() {
  const gltf = useGLTF('/SM_MFF.glb')
  const { scene } = gltf
  
  const materialColor = useAppStore(state => state.materialColor)
  const materialRoughness = useAppStore(state => state.materialRoughness)
  const materialMetalness = useAppStore(state => state.materialMetalness)
  
  // Контроль через Leva
  const { 
    aoIntensity, 
    lightmapIntensity, 
    envMapIntensity,
    useEXR 
  } = useControls('Lightmap Settings', {
    aoIntensity: { value: 2.5, min: 0, max: 5, step: 0.1, label: 'AO Intensity' },
    lightmapIntensity: { value: 1.0, min: 0, max: 3, step: 0.1, label: 'Lightmap Intensity' },
    envMapIntensity: { value: 1.2, min: 0, max: 3, step: 0.1, label: 'Env Map Intensity' },
    useEXR: { value: true, label: 'Use EXR Lightmap' },
  })
  
  // Загружаем текстуры
  const [textures, setTextures] = useState<any>(null)
  
  useEffect(() => {
    const loadTextures = async () => {
      try {
        // Загружаем AO, BaseColor, Normal, Roughness, Metallic
        const textureLoader = new THREE.TextureLoader()
        
        const aoMap = await textureLoader.loadAsync('/textures/venue/SM_MFF_AO.png')
        aoMap.colorSpace = THREE.NoColorSpace
        
        const baseColor = await textureLoader.loadAsync('/textures/venue/SM_MFF_BaseColor.png')
        baseColor.colorSpace = THREE.SRGBColorSpace
        
        const normalMap = await textureLoader.loadAsync('/textures/venue/SM_MFF_Normal.png')
        normalMap.colorSpace = THREE.NoColorSpace
        
        const roughnessMap = await textureLoader.loadAsync('/textures/venue/SM_MFF_Roughness.png')
        roughnessMap.colorSpace = THREE.NoColorSpace
        
        const metalnessMap = await textureLoader.loadAsync('/textures/venue/SM_MFF_Metallic.png')
        metalnessMap.colorSpace = THREE.NoColorSpace
        
        // Загружаем Lightmap (EXR или HDR)
        let lightMap = null
        if (useEXR) {
          try {
            const exrLoader = new EXRLoader()
            lightMap = await exrLoader.loadAsync('/textures/venue/SM_MFF_Lightmap.exr')
            console.log('✅ EXR Lightmap loaded')
          } catch (err) {
            console.warn('⚠️ EXR not found, trying HDR...')
            try {
              const hdrLoader = new RGBELoader()
              lightMap = await hdrLoader.loadAsync('/textures/venue/SM_MFF_Lightmap.hdr')
              console.log('✅ HDR Lightmap loaded')
            } catch (err2) {
              console.warn('⚠️ HDR not found, trying PNG...')
              lightMap = await textureLoader.loadAsync('/textures/venue/SM_MFF_Lightmap.png')
              lightMap.colorSpace = THREE.SRGBColorSpace
              console.log('✅ PNG Lightmap loaded (fallback)')
            }
          }
        } else {
          // Используем PNG lightmap
          lightMap = await textureLoader.loadAsync('/textures/venue/SM_MFF_Lightmap.png')
          lightMap.colorSpace = THREE.SRGBColorSpace
          console.log('✅ PNG Lightmap loaded')
        }
        
        setTextures({
          aoMap,
          baseColor,
          normalMap,
          roughnessMap,
          metalnessMap,
          lightMap,
        })
        
        console.log('✅ All textures loaded')
      } catch (error) {
        console.error('❌ Error loading textures:', error)
      }
    }
    
    loadTextures()
  }, [useEXR])

  useEffect(() => {
    if (!gltf?.scene || !textures) return
    
    console.log('🎨 Applying textures to model...')
    
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Создаем материал с запеченными текстурами
        const material = new THREE.MeshStandardMaterial({
          // Base Color
          map: textures.baseColor,
          color: new THREE.Color(materialColor),
          
          // AO Map - затемнение углов
          aoMap: textures.aoMap,
          aoMapIntensity: aoIntensity,
          
          // Lightmap - запеченное освещение (HDR!)
          lightMap: textures.lightMap,
          lightMapIntensity: lightmapIntensity,
          
          // Normal Map
          normalMap: textures.normalMap,
          normalScale: new THREE.Vector2(1, 1),
          
          // Roughness Map
          roughnessMap: textures.roughnessMap,
          roughness: materialRoughness,
          
          // Metallic Map
          metalnessMap: textures.metalnessMap,
          metalness: materialMetalness,
          
          // Environment Map
          envMapIntensity: envMapIntensity,
          
          side: THREE.DoubleSide,
        })
        
        // UV2 для AO и Lightmap
        if (child.geometry.attributes.uv) {
          child.geometry.attributes.uv2 = child.geometry.attributes.uv
        }
        
        child.material = material
        child.castShadow = true
        child.receiveShadow = true
        
        console.log('✅ Material applied to:', child.name)
      }
    })
    
    console.log('✅ All materials applied!')
  }, [gltf, textures, materialColor, materialRoughness, materialMetalness, aoIntensity, lightmapIntensity, envMapIntensity])

  return <primitive object={scene} />
}

export default function VenueModelWithLightmap() {
  return <LoadedModel />
}
