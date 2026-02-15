import { useAppStore } from '../store/appStore'
import { Html } from '@react-three/drei'
import { useCameraType } from '../hooks/useCameraType'

export default function UserMarker() {
  const userLocation = useAppStore(state => state.userLocation)
  const viewMode = useAppStore(state => state.viewMode)
  const showPOI = useAppStore(state => state.showPOI)
  const { isOrthographic } = useCameraType()

  // Hide in first-person mode — no need to see yourself
  // Also hide when POI is disabled
  if (!userLocation || viewMode === 'first-person' || !showPOI) return null

  return (
    <group position={userLocation.position}>
      {/* User marker - blue pulsing circle */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="#0066cc" opacity={0.6} transparent />
      </mesh>

      {/* Direction indicator */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, userLocation.rotation]}>
        <coneGeometry args={[0.5, 1, 3]} />
        <meshBasicMaterial color="#00ccff" />
      </mesh>

      {/* Vertical line */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 6]} />
        <meshBasicMaterial color="#0066cc" opacity={0.3} transparent />
      </mesh>

      {/* Label */}
      <Html
        position={[0, 4, 0]}
        style={{ pointerEvents: 'none' }}
        occlude={false}
      >
        <div
          className="bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-lg"
          style={{ fontSize: isOrthographic ? '7px' : '10px' }}
        >
          Вы здесь
        </div>
      </Html>
    </group>
  )
}
