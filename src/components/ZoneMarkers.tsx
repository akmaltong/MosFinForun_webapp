import { useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useAppStore } from '../store/appStore'
import { zones } from '../data/mockData'
import ZoneMarkerHighlight from './ZoneMarkerHighlight'
import { useCameraType } from '../hooks/useCameraType'

export default function ZoneMarkers() {
  const zonesFromStore = useAppStore(state => state.zones)
  const selectedZone = useAppStore(state => state.selectedZone)
  const setSelectedZone = useAppStore(state => state.setSelectedZone)
  const setCameraTarget = useAppStore(state => state.setCameraTarget)
  const showPOI = useAppStore(state => state.showPOI)
  const { isOrthographic } = useCameraType()

  // Load zones into store initially
  useEffect(() => {
    if (zonesFromStore.length === 0) {
      useAppStore.setState({ zones })
    }
  }, [zonesFromStore.length])

  // Use zones from store (will update when edited)
  const currentZones = zonesFromStore.length > 0 ? zonesFromStore : zones

  // Don't render if POI is hidden
  if (!showPOI) {
    return null
  }

  return (
    <>
      {currentZones.map(zone => {
        const isSelected = selectedZone?.id === zone.id

        const handleClick = () => {
          setSelectedZone(zone)
          setCameraTarget(zone.id)
        }

        return (
          <group key={zone.id} position={[zone.position[0], zone.position[1], zone.position[2]]}>
            {/* Invisible clickable area */}
            <mesh
              position={[0, 2, 0]}
              onClick={handleClick}
            >
              <cylinderGeometry args={[3, 3, 4, 32]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Highlight sphere for selected zone */}
            {isSelected && (
              <ZoneMarkerHighlight position={[0, 0, 0]} color={zone.color} />
            )}

            {/* Zone label — CSS-based, always screen-space for consistent size */}
            <Html
              position={[0, 8, 0]}
              center
              occlude={false}
              style={{ pointerEvents: 'auto' }}
            >
              <div
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap cursor-pointer select-none transition-all ${isSelected
                  ? 'bg-white/20 text-white scale-110 ring-1 ring-white/30'
                  : 'bg-black/50 text-white/90 hover:bg-black/60'
                  }`}
                style={{
                  borderLeft: `3px solid ${zone.color}`,
                  fontSize: isOrthographic ? '8px' : '13px',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderLeftWidth: '3px',
                  borderLeftColor: zone.color,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  letterSpacing: '0.01em',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                {zone.name}
              </div>
            </Html>
          </group>
        )
      })}
    </>
  )
}
