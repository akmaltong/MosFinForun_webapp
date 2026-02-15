import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

/**
 * Компонент для отображения геометрии зон
 * Подсвечивает выбранную зону прозрачным материалом
 */

// Маппинг названий зон на имена мешей в Blender модели
const ZONE_MESH_MAPPING: Record<string, string> = {
  'Конференц-зал I': 'Конференц-зал_1',
  'Конференц-зал II': 'Конференц-зал_2',
  'Конференц-зал III': 'Конференц-зал_3',
  'Конференц-зал IV': 'Конференц-зал_4',
  'Овальный зал': 'Овальный_зал',
  'Зал пленарного заседания': 'Зал_пленарного_заседания',
  'VIP-зал': 'VIP-зал',
  'Арт-объект': 'Арт-объект',
  'Пресс-подход 1': 'Пресс-подход_1',
  'Пресс-подход 2': 'Пресс-подход_2',
  'Лаунж-зона 1': 'Лаунж-зона_1',
  'Лаунж-зона 2': 'Лаунж-зона_2',
  'Аккредитация': 'Аккредитация',
  'Инфо-стойка': 'Инфо-стойка',
  'Экспозиция': 'Экспозиция',
  'Фойе': 'Фойе',
  'Фото-зона': 'Фото-зона',
}

export default function ZoneGeometry() {
  const gltf = useGLTF('/Zones.glb')
  const selectedZone = useAppStore(state => state.selectedZone)

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
      console.log('🔍 Looking for mesh:', ZONE_MESH_MAPPING[selectedZone.name])
    }

    // Создаем светящийся материал для подсветки зоны
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4CAF50'),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
      emissive: new THREE.Color('#4CAF50'),
      emissiveIntensity: 2.0,
      metalness: 0,
      roughness: 1,
      toneMapped: false, // Отключаем tone mapping для яркого свечения
    })

    let foundMatch = false

    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // Сохраняем оригинальный материал
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material
        }

        // Проверяем через маппинг
        const meshName = selectedZone ? ZONE_MESH_MAPPING[selectedZone.name] : null
        const isSelected = meshName && child.name === meshName

        if (isSelected) {
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
          newMaterial.emissiveIntensity = 2.0 // Яркое свечение
          newMaterial.opacity = 0.5
          
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
      console.warn('⚠️ No mesh found for zone:', selectedZone.name, '(expected mesh:', ZONE_MESH_MAPPING[selectedZone.name], ')')
    }

    return () => {
      highlightMaterial.dispose()
    }
  }, [gltf, selectedZone])

  return <primitive object={gltf.scene} />
}
