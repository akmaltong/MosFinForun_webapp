import { Environment } from '@react-three/drei'
import { useAppStore } from '../store/appStore'

/**
 * HDRI Environment - освещение и фон сцены
 * Использует equirectangular HDR изображения для реалистичного освещения
 */

export function HDRIEnvironment() {
  const hdriFile = useAppStore(state => state.hdriFile)
  const hdriIntensity = useAppStore(state => state.hdriIntensity)
  const hdriRotation = useAppStore(state => state.hdriRotation)
  const hdriBlur = useAppStore(state => state.hdriBlur)
  const showHdriBackground = useAppStore(state => state.showHdriBackground)

  const rotationRad = (hdriRotation * Math.PI) / 180

  return (
    <Environment
      files={`/${hdriFile}`}
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
