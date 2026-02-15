import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { events } from '../data/mockData'
import { format, differenceInMinutes } from 'date-fns'
import { calculateRoute } from '../utils/navigation'

type FilterType = 'all' | 'favorites' | 'now'

export default function EventsPanel() {
  const setActivePanel = useAppStore(state => state.setActivePanel)
  const selectedEvent = useAppStore(state => state.selectedEvent)
  const setSelectedEvent = useAppStore(state => state.setSelectedEvent)
  const favoriteEvents = useAppStore(state => state.favoriteEvents)
  const toggleFavoriteEvent = useAppStore(state => state.toggleFavoriteEvent)
  const zones = useAppStore(state => state.zones)
  const setRoute = useAppStore(state => state.setRoute)

  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  useEffect(() => {
    useAppStore.setState({ events })
  }, [])

  const eventsWithStatus = useMemo(() => {
    const now = new Date()
    let filtered = events.map(event => {
      const minutesToStart = differenceInMinutes(event.startTime, now)
      const minutesToEnd = differenceInMinutes(event.endTime, now)

      let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming'
      if (minutesToEnd < 0) status = 'completed'
      else if (minutesToStart <= 0) status = 'ongoing'

      return { ...event, status, minutesToStart }
    })

    if (activeFilter === 'favorites') {
      filtered = filtered.filter(e => favoriteEvents.includes(e.id))
    } else if (activeFilter === 'now') {
      filtered = filtered.filter(e => e.status === 'ongoing' || (e.status === 'upcoming' && e.minutesToStart <= 30))
    }

    return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }, [activeFilter, favoriteEvents])

  const handleNavigateToEvent = (event: typeof events[0]) => {
    const zone = zones.find(z => z.id === event.zoneId)
    const userLocation = useAppStore.getState().userLocation
    const lastRouteDestination = useAppStore.getState().lastRouteDestination
    const setLastRouteDestination = useAppStore.getState().setLastRouteDestination

    if (zone) {
      // Use last destination if exists, otherwise use user location
      const startPosition = lastRouteDestination || userLocation?.position
      
      if (startPosition) {
        const route = calculateRoute(startPosition, zone.position)
        setRoute(route)
        setLastRouteDestination(zone.position) // Save destination for next route

        setActivePanel(null)
      }
    }
  }

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Все' },
    { id: 'favorites', label: 'Избранное' },
    { id: 'now', label: 'Сейчас' },
  ]

  return (
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-200">Расписание</h2>
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

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 shrink-0">
        {filterButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setActiveFilter(btn.id)}
            className={`flex-1 py-1 text-[11px] font-medium rounded-lg transition-all ${activeFilter === btn.id
              ? 'bg-white/10 text-white border border-white/10'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Events list */}
      <div className="overflow-y-auto px-3 pb-3 space-y-1.5">
        {eventsWithStatus.length > 0 ? (
          eventsWithStatus.map(event => {
            const isFavorite = favoriteEvents.includes(event.id)
            const zone = zones.find(z => z.id === event.zoneId)
            const isSelected = selectedEvent?.id === event.id

            return (
              <div
                key={event.id}
                className={`bg-white/5 rounded-xl px-3 py-2 cursor-pointer transition-all hover:bg-white/10 ${event.status === 'ongoing'
                  ? 'border-l-[3px] border-green-500/60'
                  : event.status === 'completed'
                    ? 'border-l-[3px] border-gray-600/40 opacity-50'
                    : 'border-l-[3px] border-[rgba(212,175,55,0.4)]'
                  } ${isSelected ? 'ring-1 ring-white/20' : ''}`}
                onClick={() => setSelectedEvent(event.id === selectedEvent?.id ? null : event)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs leading-tight truncate text-white">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                      <span>{format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}</span>
                      {zone && (
                        <>
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: zone.color }}
                          />
                          <span className="truncate">{zone.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavoriteEvent(event.id)
                    }}
                    className={`text-sm p-0.5 shrink-0 transition-transform hover:scale-110 ${isFavorite ? 'text-amber-400' : 'text-gray-600'}`}
                  >
                    {isFavorite ? '\u2605' : '\u2606'}
                  </button>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {event.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-1.5 py-0 bg-white/5 text-gray-500 text-[9px] rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06]">
                    <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">{event.description}</p>

                    {event.speakers && event.speakers.length > 0 && (
                      <div className="mb-2 text-[10px]">
                        <span className="text-gray-500">Спикеры: </span>
                        <span className="text-gray-300">{event.speakers.join(', ')}</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigateToEvent(event)
                      }}
                      className="w-full bg-white/10 hover:bg-white/15 text-white py-1.5 rounded-lg font-medium transition-all text-[10px] border border-white/[0.06]"
                    >
                      Проложить маршрут
                    </button>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-30">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-xs">
              {activeFilter === 'favorites'
                ? 'В избранном пока пусто'
                : activeFilter === 'now'
                  ? 'Нет текущих событий'
                  : 'Список пуст'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
