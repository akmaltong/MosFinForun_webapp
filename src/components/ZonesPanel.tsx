import { useState } from 'react'
import { useAppStore } from '../store/appStore'

export default function ZonesPanel() {
  const zones = useAppStore(state => state.zones)
  const setActivePanel = useAppStore(state => state.setActivePanel)
  const setSelectedZone = useAppStore(state => state.setSelectedZone)
  const events = useAppStore(state => state.events)
  const setViewMode = useAppStore(state => state.setViewMode)
  const setRoute = useAppStore(state => state.setRoute)
  const favoriteEvents = useAppStore(state => state.favoriteEvents)
  const toggleFavoriteEvent = useAppStore(state => state.toggleFavoriteEvent)
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null)

  const handleTeleport = (zone: typeof zones[0]) => {
    setViewMode('angle')
    const { setCameraTarget } = useAppStore.getState()
    setCameraTarget(zone.id)
    // Don't close panel — keep list open
  }



  const getZoneEvents = (zoneId: string) => {
    return events.filter(e => e.zoneId === zoneId)
  }

  const zoneIcon = (type: string) => {
    switch (type) {
      case 'conference': return '\uD83C\uDFA4'
      case 'exhibition': return '\uD83C\uDFE2'
      case 'food': return '\uD83C\uDF7D\uFE0F'
      case 'registration': return '\uD83D\uDCDD'
      case 'lounge': return '\u2615'
      default: return '\uD83D\uDCCD'
    }
  }

  return (
    <>
      <div
        className="h-full text-white overflow-hidden flex flex-col m-2 shadow-2xl"
        style={{
          backgroundColor: 'rgba(40, 40, 40, 0.4)',
          backdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
          borderRadius: '25px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(212, 175, 55, 0.8)' }}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-200">Зоны форума</h2>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="text-gray-500 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Zones list */}
      <div className="overflow-y-auto px-3 py-2 space-y-1.5">
        {zones.map(zone => {
          const zoneEvents = getZoneEvents(zone.id)
          const isExpanded = expandedZoneId === zone.id

          return (
            <div
              key={zone.id}
              className={`bg-white/5 rounded-xl px-3 py-2 cursor-pointer transition-all hover:bg-white/10 ${isExpanded ? 'ring-1 ring-white/20 bg-white/10' : ''}`}
              style={{ borderLeftColor: zone.color, borderLeftWidth: '3px' }}
              onClick={() => {
                if (!isExpanded) {
                  setExpandedZoneId(zone.id)
                  // Fly camera to zone and highlight zone geometry
                  setViewMode('angle')
                  const { setCameraTarget } = useAppStore.getState()
                  setCameraTarget(zone.id)
                  setSelectedZone(zone) // Подсветить геометрию зоны
                  // Close the zones panel
                  setActivePanel(null)
                } else {
                  setExpandedZoneId(null)
                }
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">{zoneIcon(zone.type)}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-xs leading-tight truncate text-white">{zone.name}</h3>
                  <p className="text-[10px] text-gray-400 truncate">{zone.description}</p>
                </div>
                {zoneEvents.length > 0 && (
                  <span className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded-md shrink-0">
                    {zoneEvents.length}
                  </span>
                )}
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-gray-600 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-2">
                  {/* Zone events (inline like EventsPanel) */}
                  {zoneEvents.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">Мероприятия</div>
                      {zoneEvents.slice(0, 3).map(event => {
                        const isFavorite = favoriteEvents.includes(event.id)
                        return (
                          <div key={event.id} className="bg-white/5 rounded-lg px-2 py-1.5 border border-white/[0.04]">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[10px] text-white truncate">{event.title}</div>
                                <div className="text-[9px] text-gray-400">
                                  {new Date(event.startTime).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Favorite button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFavoriteEvent(event.id)
                                  }}
                                  className={`p-1 rounded transition-colors ${
                                    isFavorite 
                                      ? 'text-amber-400 hover:text-amber-300' 
                                      : 'text-gray-600 hover:text-gray-400'
                                  }`}
                                  title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {zoneEvents.length > 3 && (
                        <div className="text-[9px] text-gray-600 text-center">
                          + ещё {zoneEvents.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
    </>
  )
}
