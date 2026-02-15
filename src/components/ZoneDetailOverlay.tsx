import { useAppStore } from '../store/appStore'
import { format, isPast, isFuture, isWithinInterval } from 'date-fns'
import { calculateRoute } from '../utils/navigation'

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

export default function ZoneDetailOverlay() {
  const selectedZone = useAppStore(state => state.selectedZone)
  const setSelectedZone = useAppStore(state => state.setSelectedZone)
  const events = useAppStore(state => state.events)
  const userLocation = useAppStore(state => state.userLocation)
  const setRoute = useAppStore(state => state.setRoute)
  const currentRoute = useAppStore(state => state.currentRoute)
  const lastRouteDestination = useAppStore(state => state.lastRouteDestination)
  const setLastRouteDestination = useAppStore(state => state.setLastRouteDestination)
  const setCameraTarget = useAppStore(state => state.setCameraTarget)
  const setActivePanel = useAppStore(state => state.setActivePanel)
  const setViewMode = useAppStore(state => state.setViewMode)
  const setUserLocation = useAppStore(state => state.setUserLocation)

  if (!selectedZone) return null

  const zoneEvents = events.filter(e => e.zoneId === selectedZone.id)
  const now = new Date()

  const currentEvents = zoneEvents.filter(e => isWithinInterval(now, { start: e.startTime, end: e.endTime }))
  const upcomingEvents = zoneEvents.filter(e => isFuture(e.startTime))
  const pastEvents = zoneEvents.filter(e => isPast(e.endTime))



  const handleNavigate = () => {
    // Use last destination if exists, otherwise use user location
    const startPosition = lastRouteDestination || userLocation?.position

    if (startPosition) {
      // Teleport user to start position if chaining routes (simulating arrival)
      if (lastRouteDestination && userLocation) {
        setUserLocation({ ...userLocation, position: lastRouteDestination })
      }

      const route = calculateRoute(startPosition, selectedZone.position)
      setRoute(route)
      setLastRouteDestination(selectedZone.position) // Save destination for next route

      setCameraTarget(null)

      setSelectedZone(null)
      setActivePanel(null)
    }
  }

  const handleCancelRoute = () => {
    setRoute(null)
    setLastRouteDestination(null) // Reset to start from user location again
    setSelectedZone(null)
  }

  return (
    <div
      className="absolute top-2 left-2 right-2 sm:right-auto sm:top-4 sm:left-4 sm:w-[95%] max-w-sm pointer-events-auto overflow-hidden max-h-[85vh] flex flex-col z-50"
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
      <div className="px-4 pt-4 pb-3 flex items-start justify-between shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: selectedZone.color + '20', border: `1px solid ${selectedZone.color}40` }}
          >
            {zoneIcon(selectedZone.type)}
          </div>
          <div>
            <h2 className="text-white font-semibold text-base leading-tight">{selectedZone.name}</h2>
            <p className="text-gray-500 text-[11px]">{selectedZone.description}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedZone(null)}
          className="text-gray-500 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="px-4 py-3 shrink-0 space-y-2">
        <button
          onClick={handleNavigate}
          className="w-full bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-xl font-semibold transition-all active:scale-[0.98] border border-white/[0.08] flex items-center justify-center gap-2 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span>Проложить маршрут</span>
        </button>

        {currentRoute && (
          <button
            onClick={handleCancelRoute}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl font-semibold transition-all active:scale-[0.98] border border-red-500/20 flex items-center justify-center gap-2 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Отменить маршрут</span>
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-3">
        {/* Ongoing */}
        {currentEvents.length > 0 && (
          <div>
            <h3 className="text-emerald-400 text-[10px] font-medium uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Сейчас идет
            </h3>
            <div className="space-y-1.5">
              {currentEvents.map(event => (
                <div key={event.id} className="bg-white/5 rounded-xl px-3 py-2 border border-emerald-500/10">
                  <div className="font-semibold text-xs text-white">{event.title}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    до {format(event.endTime, 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcomingEvents.length > 0 && (
          <div>
            <h3 className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1.5">Скоро</h3>
            <div className="space-y-1.5">
              {upcomingEvents.map(event => (
                <div key={event.id} className="bg-white/5 rounded-xl px-3 py-2 border border-white/[0.04]">
                  <div className="font-semibold text-xs text-gray-200">{event.title}</div>
                  <div className="text-[10px] text-blue-400/70 mt-0.5 font-medium">
                    {format(event.startTime, 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past */}
        {pastEvents.length > 0 && (
          <div>
            <h3 className="text-gray-600 text-[10px] font-medium uppercase tracking-wider mb-1.5">Прошедшие</h3>
            <div className="space-y-1.5 opacity-50">
              {pastEvents.map(event => (
                <div key={event.id} className="bg-white/5 rounded-xl px-3 py-2">
                  <div className="font-semibold text-xs text-gray-400 line-through">{event.title}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">завершено</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {zoneEvents.length === 0 && (
          <div className="py-6 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-gray-700">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-gray-600 text-xs">Событий не запланировано</p>
          </div>
        )}
      </div>
    </div>
  )
}
