import { Environment } from '@react-three/drei'
import { useAppStore } from '../store/appStore'

/**
 * HDRI Environment - освещение и фон сцены
 * Sky mode: HDR skybox с настраиваемыми параметрами
 * Baked mode: только ambientLight, без HDRI (освещение из lightmap)
 */

export function HDRIEnvironment() {
  const lightingMode = useAppStore(state => state.lightingMode)
  const hdriFile = useAppStore(state => state.hdriFile)
  const hdriIntensity = useAppStore(state => state.hdriIntensity)
  const hdriRotation = useAppStore(state => state.hdriRotation)
  const hdriBlur = useAppStore(state => state.hdriBlur)
  const showHdriBackground = useAppStore(state => state.showHdriBackground)

  if (lightingMode === 'baked') {
    // Baked mode: мягкий белый свет, яркость управляется через hdriIntensity
    return (
      <>
        <ambientLight intensity={hdriIntensity * 0.5} color="#ffffff" />
        {showHdriBackground ? (
          <color attach="background" args={['#f0f0f0']} />
        ) : (
          <color attach="background" args={['#0a0a0f']} />
        )}
      </>
    )
  }

  // Sky mode: full HDRI environment
  const rotationRad = (hdriRotation * Math.PI) / 180

  return (
    <Environment
      files={hdriFile}
      background={showHdriBackground}
      backgroundIntensity={hdriIntensity * 0.3}
      backgroundBlurriness={hdriBlur}
      backgroundRotation={[0, rotationRad, 0]}
      environmentIntensity={hdriIntensity}
      environmentRotation={[0, rotationRad, 0]}
    />
  )
}

export default HDRIEnvironment
