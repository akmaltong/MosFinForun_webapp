import { useAppStore } from '../store/appStore'
import { calculateRoute } from '../utils/navigation'

export default function FriendsPanel() {
  const friends = useAppStore(state => state.friends)
  const selectedFriend = useAppStore(state => state.selectedFriend)
  const setSelectedFriend = useAppStore(state => state.setSelectedFriend)
  const setActivePanel = useAppStore(state => state.setActivePanel)
  const setRoute = useAppStore(state => state.setRoute)

  const handleNavigateToFriend = (friend: typeof friends[0]) => {
    const userLocation = useAppStore.getState().userLocation
    const lastRouteDestination = useAppStore.getState().lastRouteDestination
    const setLastRouteDestination = useAppStore.getState().setLastRouteDestination

    // Use last destination if exists, otherwise use user location
    const startPosition = lastRouteDestination || userLocation?.position

    if (startPosition) {
      const route = calculateRoute(startPosition, friend.location.position)
      setRoute(route)
      setLastRouteDestination(friend.location.position) // Save destination for next route

      setActivePanel(null)
    }
  }

  const onlineCount = friends.filter(f => f.isOnline).length

  return (
    <div
      className="max-h-[calc(100vh-60px)] text-white overflow-hidden flex flex-col m-2 shadow-2xl"
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-200">Друзья</h2>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium">
            {onlineCount} онлайн
          </span>
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

      {/* Friends list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {friends.map(friend => {
          const isSelected = selectedFriend?.id === friend.id

          return (
            <div
              key={friend.id}
              className={`bg-white/5 rounded-xl px-3 py-2 cursor-pointer transition-all hover:bg-white/10 ${isSelected ? 'ring-1 ring-white/20' : ''
                } ${!friend.isOnline ? 'opacity-40' : ''}`}
              onClick={() => setSelectedFriend(isSelected ? null : friend)}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  {friend.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black/40 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs leading-tight truncate text-gray-100">{friend.name}</h3>
                  <p className="text-[10px] text-gray-500">
                    {friend.isOnline ? 'В сети' : 'Не в сети'}
                  </p>
                </div>
              </div>

              {isSelected && friend.isOnline && (
                <div className="mt-2 pt-2 border-t border-white/[0.06]">
                  <div className="text-[10px] text-gray-500 mb-2">
                    Местоположение: Главная площадка
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigateToFriend(friend)
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white py-1.5 rounded-lg font-medium transition-all text-[10px] border border-white/[0.06]"
                    >
                      Найти на карте
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 bg-white/10 hover:bg-white/15 text-white py-1.5 rounded-lg font-medium transition-all border border-white/[0.06]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {friends.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-20">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-xs mb-3">У вас пока нет друзей на форуме</p>
            <button className="px-4 py-1.5 bg-white/10 text-white text-xs rounded-lg hover:bg-white/15 border border-white/[0.06] transition-all">
              Добавить друзей
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
