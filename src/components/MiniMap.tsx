import { useAppStore } from '../store/appStore'

export default function MiniMap() {
  const zones = useAppStore(state => state.zones)
  const userLocation = useAppStore(state => state.userLocation)
  const selectedZone = useAppStore(state => state.selectedZone)
  const currentRoute = useAppStore(state => state.currentRoute)
  
  // Convert 3D coordinates to 2D minimap coordinates with rotation
  const to2D = (pos: [number, number, number]): [number, number] => {
    const scale = 2
    const offsetX = 100
    const offsetY = 100
    // Rotate 90 degrees counterclockwise: new_x = -z, new_y = x
    return [
      offsetX - pos[2] * scale,  // -Z becomes X (pointing up)
      offsetY - pos[0] * scale   // -X becomes Y
    ]
  }
  
  return (
    <div
      className="p-3 shadow-2xl"
      style={{
        backgroundColor: 'rgba(104, 104, 104, 0.15)',
        backdropFilter: 'blur(8px) saturate(150%) brightness(1.2)',
        WebkitBackdropFilter: 'blur(8px) saturate(150%) brightness(1.2)',
        borderRadius: '25px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 0 6px 2px rgba(255,255,255,0.04)',
      }}
    >
      <div className="text-white text-xs font-bold mb-2 flex items-center justify-between">
        <span>Мини-карта</span>
        <span className="text-gray-400">📍</span>
      </div>
      
      <svg 
        width="200" 
        height="200" 
        className="rounded-lg"
        style={{ background: 'rgba(0,0,0,0.2)' }}
        viewBox="0 0 200 200"
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path 
              d="M 20 0 L 0 0 0 20" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#grid)" />
        
        {/* Zones */}
        {zones.map(zone => {
          const [x, y] = to2D(zone.position)
          const isSelected = selectedZone?.id === zone.id
          
          return (
            <g key={zone.id}>
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 8 : 6}
                fill={zone.color}
                opacity={isSelected ? 0.8 : 0.5}
                stroke={isSelected ? 'white' : 'none'}
                strokeWidth={isSelected ? 2 : 0}
              />
            </g>
          )
        })}
        
        {/* Route path */}
        {currentRoute && userLocation && (
          <>
            {/* Route line */}
            <line
              x1={to2D(userLocation.position)[0]}
              y1={to2D(userLocation.position)[1]}
              x2={to2D(currentRoute.to)[0]}
              y2={to2D(currentRoute.to)[1]}
              stroke="#00ccff"
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.6"
            />
            
            {/* Destination */}
            <circle
              cx={to2D(currentRoute.to)[0]}
              cy={to2D(currentRoute.to)[1]}
              r="10"
              fill="none"
              stroke="#ff6b35"
              strokeWidth="2"
            />
          </>
        )}
        
        {/* User position */}
        {userLocation && (
          <g>
            {/* Pulse effect */}
            <circle
              cx={to2D(userLocation.position)[0]}
              cy={to2D(userLocation.position)[1]}
              r="12"
              fill="#0066cc"
              opacity="0.2"
            >
              <animate
                attributeName="r"
                from="8"
                to="16"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.4"
                to="0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            
            {/* User dot */}
            <circle
              cx={to2D(userLocation.position)[0]}
              cy={to2D(userLocation.position)[1]}
              r="5"
              fill="#00ccff"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
    </div>
  )
}
