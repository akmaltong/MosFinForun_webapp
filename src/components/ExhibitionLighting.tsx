import { useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

/**
 * Выставочное освещение (Exhibition/Gallery Style)
 * Яркое, чистое освещение без резких теней
 * В стиле Netlify 5M Devs - playful и vibrant
 */
export function ExhibitionLighting() {
  const mainLightRef = useRef<THREE.DirectionalLight>(null)
  
  const hdriRotation = useAppStore(state => state.hdriRotation)
  
  const rotationRad = (hdriRotation * Math.PI) / 180
  
  // Основной свет - сверху и спереди
  const mainLightDistance = 60
  const mainLightX = Math.sin(rotationRad) * mainLightDistance * 0.3
  const mainLightZ = Math.cos(rotationRad) * mainLightDistance * 0.3
  const mainLightY = 50
  
  return (
    <>
      {/* Высокое ambient освещение для яркости */}
      <ambientLight 
        intensity={1.2} 
        color="#ffffff" 
      />
      
      {/* Hemisphere Light - равномерное освещение */}
      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#e8e8e8"
        intensity={1.0}
        position={[0, 50, 0]}
      />
      
      {/* Main Light - основной мягкий свет */}
      <directionalLight
        ref={mainLightRef}
        position={[mainLightX, mainLightY, mainLightZ]}
        intensity={1.5}
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
        shadow-radius={4}
      />
      
      {/* Дополнительные источники для равномерности */}
      <directionalLight
        position={[-30, 40, -30]}
        intensity={0.8}
        color="#f5f5ff"
        castShadow={false}
      />
      
      <directionalLight
        position={[30, 40, 30]}
        intensity={0.8}
        color="#fff5f5"
        castShadow={false}
      />
      
      {/* Точечные источники для акцентов */}
      <pointLight
        position={[0, 35, 0]}
        intensity={1.5}
        color="#ffffff"
        distance={100}
        decay={1.5}
      />
      
      {/* Заполняющие источники по углам */}
      <pointLight
        position={[-40, 20, -40]}
        intensity={1.0}
        color="#e8f4ff"
        distance={80}
        decay={2}
      />
      
      <pointLight
        position={[40, 20, 40]}
        intensity={1.0}
        color="#ffe8f4"
        distance={80}
        decay={2}
      />
      
      <pointLight
        position={[-40, 20, 40]}
        intensity={1.0}
        color="#f4ffe8"
        distance={80}
        decay={2}
      />
      
      <pointLight
        position={[40, 20, -40]}
        intensity={1.0}
        color="#fff4e8"
        distance={80}
        decay={2}
      />
      
      {/* Нижний свет для устранения темных областей */}
      <directionalLight
        position={[0, -10, 0]}
        intensity={0.4}
        color="#d8d8d8"
        castShadow={false}
      />
    </>
  )
}

export default ExhibitionLighting
