import { useAppStore } from '../store/appStore'

export default function MenuPanel() {
  const setActivePanel = useAppStore(state => state.setActivePanel)
  const viewMode = useAppStore(state => state.viewMode)
  const setViewMode = useAppStore(state => state.setViewMode)
  const showMiniMap = useAppStore(state => state.showMiniMap)
  const toggleMiniMap = useAppStore(state => state.toggleMiniMap)
  const setEditMode = (enabled: boolean) => useAppStore.setState({ editMode: enabled })
  const setPoiEditMode = (enabled: boolean) => useAppStore.setState({ poiEditMode: enabled })

  const viewModes: { id: string; label: string; icon: React.ReactNode }[] = [
    {
      id: 'top',
      label: 'Сверху',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      ),
    },
    {
      id: 'angle',
      label: 'Под углом',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
  ]

  const menuItems = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      title: 'Главная',
      description: 'Вернуться к обзору',
      action: () => {
        setViewMode('angle')
        setActivePanel(null)
      },
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      title: 'Редактор зон',
      description: 'Настройка позиций зон',
      action: () => {
        setEditMode(true)
        setActivePanel(null)
      },
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
      title: 'Режим POI',
      description: 'Настройка точек обзора',
      action: () => {
        setPoiEditMode(true)
        setActivePanel(null)
      },
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
      title: showMiniMap ? 'Скрыть мини-карту' : 'Показать мини-карту',
      description: 'Переключить отображение',
      action: () => toggleMiniMap(),
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
      title: 'О форуме',
      description: 'Информация о мероприятии',
      action: () => alert('Московский Финансовый Форум 2026'),
    },
  ]

  return (
    <div className="max-h-[calc(100vh-60px)] overflow-hidden flex flex-col m-2 gold-panel">
      {/* Header with gold styling */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[rgba(212,175,55,0.2)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{
                 background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)',
                 border: '1px solid rgba(212,175,55,0.3)'
               }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold gold-shine-text">Настройки</h2>
            <p className="text-xs text-gray-500">Панель управления</p>
          </div>
        </div>
        <button
          onClick={() => setActivePanel(null)}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* View mode selector - Gold buttons */}
      <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.15)]">
        <div className="text-xs text-[#D4AF37] mb-3 font-semibold uppercase tracking-widest">Режим просмотра</div>
        <div className="flex gap-2">
          {viewModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl font-semibold transition-all text-xs uppercase tracking-wider ${
                viewMode === mode.id
                  ? 'active'
                  : ''
              }`}
              style={{
                background: viewMode === mode.id 
                  ? 'linear-gradient(145deg, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.1) 100%)'
                  : 'linear-gradient(145deg, #252530 0%, #1a1a24 100%)',
                border: `2px solid ${viewMode === mode.id ? '#D4AF37' : 'rgba(212,175,55,0.2)'}`,
                color: viewMode === mode.id ? '#F4E8C1' : '#8B7355',
                boxShadow: viewMode === mode.id 
                  ? '0 4px 20px rgba(212,175,55,0.3), inset 0 0 20px rgba(212,175,55,0.1)'
                  : '0 4px 10px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ color: viewMode === mode.id ? '#D4AF37' : '#8B7355' }}>{mode.icon}</div>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu items - Gold styled */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full rounded-xl px-4 py-3 flex items-center gap-4 transition-all text-left group"
            style={{
              background: 'linear-gradient(145deg, #252530 0%, #1a1a24 100%)',
              border: '2px solid rgba(212,175,55,0.15)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.2), inset 0 0 20px rgba(212,175,55,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ color: '#8B7355' }} className="group-hover:text-[#D4AF37] transition-colors">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">{item.title}</div>
              <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{item.description}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
                 className="text-[#8B7355] group-hover:text-[#D4AF37] transition-colors shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Footer with gold accent */}
      <div className="px-5 py-3 text-center border-t border-[rgba(212,175,55,0.15)]"
           style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.05) 100%)' }}>
        <div className="text-xs text-gray-400 font-medium">Московский Финансовый Форум 2026</div>
        <div className="text-[10px] text-[#8B7355] mt-1">v1.0.0</div>
      </div>
    </div>
  )
}
