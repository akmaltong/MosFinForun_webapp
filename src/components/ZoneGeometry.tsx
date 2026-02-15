import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

/**
 * Компонент для отображения геометрии зон
 * Подсвечивает выбранную зону прозрачным материалом
 */



export default function ZoneGeometry() {
  const gltf = useGLTF('Zones.glb')
  const selectedZone = useAppStore(state => state.selectedZone)
  const zoneMeshMapping = useAppStore(state => state.zoneMeshMapping)

  useEffect(() => {
    if (!gltf?.scene) {
      console.log('❌ ZoneGeometry: gltf.scene not loaded')
      return
    }

    console.log('🔍 ZoneGeometry: Processing zones...')
    console.log('📍 Selected zone:', selectedZone?.name)

    // Собираем все имена мешей для отладки
    const meshNames: string[] = []
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        meshNames.push(child.name)
      }
    })
    console.log('📦 Available meshes in Zones.glb:', meshNames)

    if (selectedZone) {
      console.log('🔍 Looking for mesh:', zoneMeshMapping[selectedZone.name])
    }

    // Создаем светящийся материал для подсветки зоны
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4CAF50'),
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      emissive: new THREE.Color('#4CAF50'),
      emissiveIntensity: 1.5,
      metalness: 0,
      roughness: 1,
      toneMapped: false, // Отключаем tone mapping для яркого свечения
      alphaTest: 0, // Убираем alpha test
    })

    let foundMatch = false

    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Сохраняем оригинальный материал
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material
        }

        // Проверяем через маппинг
        const meshName = selectedZone ? zoneMeshMapping[selectedZone.name] : null
        const isSelected = meshName && child.name === meshName

        if (isSelected && selectedZone) {
          foundMatch = true
          console.log('✅ Found matching mesh:', child.name, 'for zone:', selectedZone.name)
          console.log('   Mesh position:', child.position)
          console.log('   Mesh scale:', child.scale)
          console.log('   Mesh visible:', child.visible)
          console.log('   Mesh geometry:', child.geometry)

          // Подсвечиваем выбранную зону светящимся материалом
          const newMaterial = highlightMaterial.clone()
          const zoneColor = new THREE.Color(selectedZone.color)
          newMaterial.color = zoneColor
          newMaterial.emissive = zoneColor
          newMaterial.emissiveIntensity = 1.5 // Умеренное свечение
          newMaterial.opacity = 0.15 // Еле видимая прозрачность
          newMaterial.transparent = true
          newMaterial.depthWrite = false
          newMaterial.depthTest = true
          newMaterial.needsUpdate = true

          child.material = newMaterial
          child.visible = true
          child.renderOrder = 999 // Рендерим поверх всего

          console.log('   Applied glowing material with color:', selectedZone.color)
        } else {
          // Скрываем все остальные зоны
          child.visible = false
        }
      }
    })

    if (selectedZone && !foundMatch) {
      console.warn('⚠️ No mesh found for zone:', selectedZone.name, '(expected mesh:', zoneMeshMapping[selectedZone.name], ')')
    }

    return () => {
      highlightMaterial.dispose()
    }
  }, [gltf, selectedZone, zoneMeshMapping])

  return <primitive object={gltf.scene} />
}
