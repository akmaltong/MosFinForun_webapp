import { useEffect, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'
import { initCollisionDetection } from '../utils/collisionDetection'

function LoadedModel() {
  const gltf = useGLTF('SM_MFF.glb')
  const { scene } = gltf

  const materialColor = useAppStore(state => state.materialColor)
  const materialRoughness = useAppStore(state => state.materialRoughness)
  const materialMetalness = useAppStore(state => state.materialMetalness)
  const aoIntensity = useAppStore(state => state.aoIntensity)
  const envMapIntensity = useAppStore(state => state.envMapIntensity)
  const lightmapIntensity = useAppStore(state => state.lightmapIntensity)
  const lightingMode = useAppStore(state => state.lightingMode)

  // Load lightmap texture (always preload, apply only in baked mode)
  const lightmapTexture = useTexture('textures/venue/SM_MFF_Lightmap.png')

  // Configure lightmap texture once
  useMemo(() => {
    lightmapTexture.flipY = false
    lightmapTexture.colorSpace = THREE.SRGBColorSpace
    lightmapTexture.channel = 1  // Use UV2 (TEXCOORD_1)
  }, [lightmapTexture])

  // Инициализация системы коллизий при загрузке модели
  useEffect(() => {
    if (gltf?.scene) {
      initCollisionDetection(gltf.scene)
    }
  }, [gltf])

  useEffect(() => {
    if (!gltf?.scene) return

    const isBaked = lightingMode === 'baked'
    let meshCount = 0
    let hasUV2 = false

    gltf.scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        meshCount++
        const mat = child.material
        const geo = child.geometry

        // Check UV2 from GLB (TEXCOORD_1)
        const uv2Attr = geo.attributes.uv1 || geo.attributes.uv2
        if (uv2Attr) {
          hasUV2 = true
          if (!geo.attributes.uv2 && geo.attributes.uv1) {
            geo.attributes.uv2 = geo.attributes.uv1
          }
        } else if (geo.attributes.uv) {
          geo.attributes.uv2 = geo.attributes.uv
        }

        // AO Intensity
        if (mat.aoMap) {
          mat.aoMapIntensity = aoIntensity
        }

        // Lightmap — only in Baked mode
        if (isBaked) {
          mat.lightMap = lightmapTexture
          mat.lightMapIntensity = lightmapIntensity
        } else {
          mat.lightMap = null
          mat.lightMapIntensity = 0
        }

        // Основные параметры материала
        mat.color = new THREE.Color(materialColor)
        mat.roughness = materialRoughness
        mat.metalness = materialMetalness
        mat.envMapIntensity = envMapIntensity

        // Fix Z-fighting on co-planar surfaces
        mat.polygonOffset = true
        mat.polygonOffsetFactor = 1
        mat.polygonOffsetUnits = 1

        // Тени отключены
        child.castShadow = false
        child.receiveShadow = false

        mat.needsUpdate = true
      }
    })

    console.log(`✅ Model: ${meshCount} meshes, UV2: ${hasUV2}, Mode: ${lightingMode}, Lightmap: ${isBaked ? `on (${lightmapIntensity})` : 'off'}`)
  }, [gltf, materialColor, materialRoughness, materialMetalness, aoIntensity, envMapIntensity, lightmapIntensity, lightmapTexture, lightingMode])

  return <primitive object={scene} rotation={[0, 0, 0]} scale={[1, 1, 1]} />
}

export default function VenueModelBaked() {
  return <LoadedModel />
}
