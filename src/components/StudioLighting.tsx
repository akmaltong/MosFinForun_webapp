import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

/**
 * Профессиональная трехточечная схема освещения
 * Key Light - основной свет
 * Fill Light - заполняющий свет
 * Rim Light - контровой свет для выделения контуров
 */
export function StudioLighting() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null)
  const fillLightRef = useRef<THREE.DirectionalLight>(null)
  const rimLightRef = useRef<THREE.DirectionalLight>(null)
  
  const hdriRotation = useAppStore(state => state.hdriRotation)
  const timeOfDay = useAppStore(state => state.timeOfDay)
  
  // Расчет позиции света на основе времени суток и вращения HDRI
  const rotationRad = (hdriRotation * Math.PI) / 180
  
  // Key Light - основной источник (45° сверху и сбоку)
  const keyLightDistance = 50
  const keyLightAngle = rotationRad + Math.PI / 4 // +45°
  const keyLightX = Math.sin(keyLightAngle) * keyLightDistance
  const keyLightZ = Math.cos(keyLightAngle) * keyLightDistance
  const keyLightY = 40
  
  // Fill Light - заполняющий (противоположная сторона, ниже)
  const fillLightDistance = 40
  const fillLightAngle = rotationRad + Math.PI * 0.75 // +135°
  const fillLightX = Math.sin(fillLightAngle) * fillLightDistance
  const fillLightZ = Math.cos(fillLightAngle) * fillLightDistance
  const fillLightY = 25
  
  // Rim Light - контровой (сзади, сверху)
  const rimLightDistance = 45
  const rimLightAngle = rotationRad + Math.PI // +180° (сзади)
  const rimLightX = Math.sin(rimLightAngle) * rimLightDistance
  const rimLightZ = Math.cos(rimLightAngle) * rimLightDistance
  const rimLightY = 50
  
  // Интенсивность в зависимости от времени суток
  const dayFactor = Math.max(0, Math.sin((timeOfDay / 24) * Math.PI * 2 - Math.PI / 2))
  const nightFactor = 1 - dayFactor
  
  return (
    <>
      {/* Ambient Light - базовое окружающее освещение */}
      <ambientLight 
        intensity={0.4 + nightFactor * 0.2} 
        color="#f0f0f5" 
      />
      
      {/* Hemisphere Light - небо и земля */}
      <hemisphereLight
        skyColor="#b8d4ff"
        groundColor="#8a8a8a"
        intensity={0.6 + nightFactor * 0.3}
        position={[0, 50, 0]}
      />
      
      {/* Key Light - основной направленный свет */}
      <directionalLight
        ref={keyLightRef}
        position={[keyLightX, keyLightY, keyLightZ]}
        intensity={2.5 * (0.5 + dayFactor * 0.5)}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.001}
        shadow-normalBias={0.05}
        shadow-radius={3}
      />
      
      {/* Fill Light - заполняющий свет (без теней) */}
      <directionalLight
        ref={fillLightRef}
        position={[fillLightX, fillLightY, fillLightZ]}
        intensity={1.2}
        color="#d4e4ff"
        castShadow={false}
      />
      
      {/* Rim Light - контровой свет для выделения контуров */}
      <directionalLight
        ref={rimLightRef}
        position={[rimLightX, rimLightY, rimLightZ]}
        intensity={1.5}
        color="#ffeedd"
        castShadow={false}
      />
      
      {/* Дополнительные точечные источники для акцентов */}
      <pointLight
        position={[0, 30, 0]}
        intensity={0.8}
        color="#ffffff"
        distance={80}
        decay={2}
      />
      
      {/* Ночное освещение - точечные источники снизу */}
      {nightFactor > 0.3 && (
        <>
          <pointLight
            position={[-20, 2, -20]}
            intensity={nightFactor * 2}
            color="#ffd4a3"
            distance={40}
            decay={2}
          />
          <pointLight
            position={[20, 2, 20]}
            intensity={nightFactor * 2}
            color="#ffd4a3"
            distance={40}
            decay={2}
          />
        </>
      )}
    </>
  )
}

export default StudioLighting
