import { useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

/**
 * Архитектурное освещение
 * Реалистичное освещение для архитектурной визуализации
 * Имитирует естественное солнечное освещение
 */
export function ArchitecturalLighting() {
  const sunLightRef = useRef<THREE.DirectionalLight>(null)

  const hdriRotation = useAppStore(state => state.hdriRotation)
  const timeOfDay = useAppStore(state => state.timeOfDay)

  // Расчет позиции солнца на основе времени суток
  const hourAngle = ((timeOfDay - 6) / 12) * Math.PI // 6:00 = восход, 18:00 = закат
  const sunElevation = Math.sin(hourAngle) * 60 // Высота солнца
  const sunAzimuth = (hdriRotation * Math.PI) / 180

  const sunDistance = 100
  const sunX = Math.sin(sunAzimuth) * Math.cos(hourAngle) * sunDistance
  const sunY = Math.max(10, sunElevation)
  const sunZ = Math.cos(sunAzimuth) * Math.cos(hourAngle) * sunDistance

  // Цвет солнца в зависимости от времени суток
  const getSunColor = () => {
    if (timeOfDay < 6 || timeOfDay > 20) {
      return '#4a5a7a' // Ночь - холодный синий
    } else if (timeOfDay < 8 || timeOfDay > 18) {
      return '#ffb366' // Рассвет/закат - теплый оранжевый
    } else {
      return '#fffaf0' // День - теплый белый
    }
  }

  // Интенсивность солнца
  const getSunIntensity = () => {
    if (timeOfDay < 6 || timeOfDay > 20) {
      return 0.3 // Ночь
    } else if (timeOfDay < 8 || timeOfDay > 18) {
      return 2.0 // Рассвет/закат
    } else {
      return 3.5 // День
    }
  }

  // Цвет неба
  const getSkyColor = () => {
    if (timeOfDay < 6 || timeOfDay > 20) {
      return '#1a1a2e' // Ночное небо
    } else if (timeOfDay < 8 || timeOfDay > 18) {
      return '#ff9a76' // Рассветное небо
    } else {
      return '#87ceeb' // Дневное небо
    }
  }

  return (
    <>
      {/* Ambient Light - минимальное для реализма */}
      <ambientLight
        intensity={0.3}
        color="#e8e8f0"
      />

      {/* Hemisphere Light - небо и отражение от земли */}
      {/* Hemisphere Light - небо и отражение от земли */}
      <hemisphereLight
        args={[getSkyColor(), "#6a6a6a", 0.8]}
        position={[0, 50, 0]}
      />

      {/* Sun Light - основной источник (солнце) */}
      <directionalLight
        ref={sunLightRef}
        position={[sunX, sunY, sunZ]}
        intensity={getSunIntensity()}
        color={getSunColor()}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-bias={-0.001}
        shadow-normalBias={0.05}
        shadow-radius={2}
      />

      {/* Sky Light - рассеянный свет от неба */}
      <directionalLight
        position={[0, 50, 0]}
        intensity={0.5}
        color={getSkyColor()}
        castShadow={false}
      />

      {/* Bounce Light - отраженный свет от земли */}
      <directionalLight
        position={[0, -20, 0]}
        intensity={0.3}
        color="#b8a890"
        castShadow={false}
      />

      {/* Ночное освещение - искусственные источники */}
      {(timeOfDay < 6 || timeOfDay > 19) && (
        <>
          {/* Уличные фонари */}
          <pointLight
            position={[-30, 8, -30]}
            intensity={3}
            color="#ffd4a3"
            distance={60}
            decay={2}
            castShadow
            shadow-mapSize={[512, 512]}
          />
          <pointLight
            position={[30, 8, 30]}
            intensity={3}
            color="#ffd4a3"
            distance={60}
            decay={2}
            castShadow
            shadow-mapSize={[512, 512]}
          />
          <pointLight
            position={[-30, 8, 30]}
            intensity={3}
            color="#ffd4a3"
            distance={60}
            decay={2}
          />
          <pointLight
            position={[30, 8, -30]}
            intensity={3}
            color="#ffd4a3"
            distance={60}
            decay={2}
          />
        </>
      )}
    </>
  )
}

export default ArchitecturalLighting
