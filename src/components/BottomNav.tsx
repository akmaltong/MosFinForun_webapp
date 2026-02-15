import { useAppStore } from '../store/appStore'

function NavIcon({ id }: { id: string }) {
  switch (id) {
    case 'home':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'surroundings':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'search':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    case 'lighting':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )
    case 'settings':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      )
    case 'poi':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    default:
      return null
  }
}

const buttons = [
  { id: 'home', label: 'ГЛАВНАЯ' },
  { id: 'surroundings', label: 'ЗОНЫ' },
  { id: 'search', label: 'РАСПИСАНИЕ' },
  { id: 'poi', label: 'POI' },
  { id: 'lighting', label: 'ОСВЕЩЕНИЕ' },
  { id: 'settings', label: 'НАСТРОЙКИ' },
]

export default function BottomNav() {
  const activePanel = useAppStore(state => state.activePanel)
  const setActivePanel = useAppStore(state => state.setActivePanel)
  const activeBottomPanel = useAppStore(state => state.activeBottomPanel)
  const setActiveBottomPanel = useAppStore(state => state.setActiveBottomPanel)
  const setViewMode = useAppStore(state => state.setViewMode)
  const showPOI = useAppStore(state => state.showPOI)
  const togglePOI = useAppStore(state => state.togglePOI)

  const handleClick = (id: string) => {
    if (id === 'home') {
      // Reset to overview perspective view, close all panels, animate camera
      console.log('HOME clicked, current viewMode:', useAppStore.getState().viewMode)
      setActivePanel(null)
      setActiveBottomPanel(null)
      setViewMode('angle')
      useAppStore.getState().setSelectedZone(null)
      useAppStore.getState().setResetCameraToOverview(true)
      console.log('After HOME: viewMode set to angle, resetCameraToOverview set to true')
    } else if (id === 'surroundings') {
      // Toggle zones panel
      setActivePanel(activePanel === 'zones' ? null : 'zones' as any)
      setActiveBottomPanel(null)
    } else if (id === 'search') {
      // Toggle events panel (search functionality)
      setActivePanel(activePanel === 'events' ? null : 'events' as any)
      setActiveBottomPanel(null)
    } else if (id === 'poi') {
      // Toggle POI visibility
      togglePOI()
    } else if (id === 'lighting') {
      // Toggle lighting panel
      setActivePanel(null)
      setActiveBottomPanel(activeBottomPanel === 'lighting' ? null : 'lighting')
    } else if (id === 'settings') {
      // Toggle settings panel
      setActivePanel(null)
      setActiveBottomPanel(activeBottomPanel === 'settings' ? null : 'settings')
    }
  }

  const isActive = (id: string) => {
    if (id === 'surroundings') return activePanel === 'zones'
    if (id === 'search') return activePanel === 'events'
    if (id === 'poi') return showPOI
    if (id === 'lighting') return activeBottomPanel === 'lighting'
    if (id === 'settings') return activeBottomPanel === 'settings'
    return false
  }

  return (
    <div className="flex justify-center px-2 sm:px-0" style={{ paddingBottom: '60px' }}>
      <div className="mb-2 flex items-center gap-1.5">
        {buttons.map(button => {
          const active = isActive(button.id)
          return (
            <button
              key={button.id}
              onClick={() => handleClick(button.id)}
              className="group relative flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full border"
              style={{
                width: active ? 'auto' : '42px',
                height: '42px',
                minWidth: '42px',
                minHeight: '42px',
                backgroundColor: active ? 'rgba(40,40,40,0.7)' : 'rgba(40,40,40,0.6)',
                borderColor: 'rgba(255,255,255,0.15)',
                boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.4)',
                padding: active ? '0 16px' : '0',
                gap: active ? '4px' : '0',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget
                  el.style.width = 'auto'
                  el.style.padding = '0 16px'
                  el.style.gap = '6px'
                  el.style.backgroundColor = 'rgba(40,40,40,0.7)'
                  const label = el.querySelector('.menu-text') as HTMLElement
                  if (label) {
                    label.style.maxWidth = '200px'
                    label.style.opacity = '1'
                    label.style.marginLeft = '6px'
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget
                  el.style.width = '42px'
                  el.style.padding = '0'
                  el.style.gap = '0'
                  el.style.backgroundColor = 'rgba(40,40,40,0.6)'
                  const label = el.querySelector('.menu-text') as HTMLElement
                  if (label) {
                    label.style.maxWidth = '0'
                    label.style.opacity = '0'
                    label.style.marginLeft = '0'
                  }
                }
              }}
            >
              <div className="shrink-0 text-white flex items-center justify-center" style={{ width: '20px', height: '20px' }}>
                <NavIcon id={button.id} />
              </div>
              <span
                className="menu-text text-white whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{
                  fontSize: '8px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  maxWidth: active ? '200px' : '0',
                  opacity: active ? 1 : 0,
                  marginLeft: active ? '6px' : '0',
                }}
              >
                {button.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
