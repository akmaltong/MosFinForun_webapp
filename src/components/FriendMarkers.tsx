import { useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useAppStore } from '../store/appStore'
import { friends } from '../data/mockData'
import { useCameraType } from '../hooks/useCameraType'

export default function FriendMarkers() {
  const selectedFriend = useAppStore(state => state.selectedFriend)
  const setSelectedFriend = useAppStore(state => state.setSelectedFriend)
  const showPOI = useAppStore(state => state.showPOI)
  const { isOrthographic } = useCameraType()
  
  useEffect(() => {
    useAppStore.setState({ friends })
  }, [])
  
  // Don't render if POI is hidden
  if (!showPOI) {
    return null
  }
  
  return (
    <>
      {friends.map(friend => {
        if (!friend.isOnline) return null
        
        const isSelected = selectedFriend?.id === friend.id
        
        return (
          <group key={friend.id} position={friend.location.position}>
            {/* Friend marker */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.6, 32]} />
              <meshBasicMaterial color="#00cc66" opacity={0.7} transparent />
            </mesh>
            
            {/* Avatar sphere */}
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.8, 32, 32]} />
              <meshStandardMaterial 
                color={isSelected ? "#00ff88" : "#00cc66"}
                emissive="#00cc66"
                emissiveIntensity={isSelected ? 0.5 : 0.2}
              />
            </mesh>
            
            {/* Label */}
            <Html 
              position={[0, 3.5, 0]}
              style={{ pointerEvents: 'none' }}
              occlude={false}
            >
              <div 
                className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-lg cursor-pointer transition-all pointer-events-auto ${
                  isSelected 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-800 bg-opacity-80 text-green-300 hover:bg-opacity-100'
                }`}
                style={{ fontSize: isOrthographic ? '7px' : '10px' }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFriend(isSelected ? null : friend)
                }}
              >
                👤 {friend.name}
              </div>
            </Html>
          </group>
        )
      })}
    </>
  )
}
