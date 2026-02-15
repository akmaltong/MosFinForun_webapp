import { useAppStore } from '../store/appStore'
import type { LightingPreset } from '../store/appStore'

export function LightingPresetSelector() {
  const lightingPreset = useAppStore(state => state.lightingPreset)
  const setLightingPreset = useAppStore(state => state.setLightingPreset)
  
  const presets: { value: LightingPreset; label: string; emoji: string; description: string }[] = [
    { 
      value: 'studio', 
      label: 'Студия', 
      emoji: '📸',
      description: 'Профессиональное трехточечное освещение'
    },
    { 
      value: 'architectural', 
      label: 'Архитектура', 
      emoji: '🏛️',
      description: 'Реалистичное солнечное освещение'
    },
    { 
      value: 'exhibition', 
      label: 'Выставка', 
      emoji: '🎪',
      description: 'Яркое равномерное освещение'
    },
    { 
      value: 'custom', 
      label: 'Базовое', 
      emoji: '🔧',
      description: 'Оригинальное освещение'
    },
  ]
  
  return (
    <div>
      <div style={{ 
        fontSize: '9px', 
        fontWeight: 600, 
        color: 'rgba(255,255,255,0.4)', 
        letterSpacing: '0.1em', 
        textTransform: 'uppercase', 
        marginBottom: '8px' 
      }}>
        Схема освещения
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '8px' 
      }}>
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setLightingPreset(preset.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: lightingPreset === preset.value ? 600 : 400,
              color: 'white',
              background: lightingPreset === preset.value
                ? 'rgba(255,200,120,0.25)'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${
                lightingPreset === preset.value 
                  ? 'rgba(255,200,120,0.4)' 
                  : 'rgba(255,255,255,0.08)'
              }`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              if (lightingPreset !== preset.value) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              }
            }}
            onMouseLeave={(e) => {
              if (lightingPreset !== preset.value) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              marginBottom: '2px'
            }}>
              <span style={{ fontSize: '14px' }}>{preset.emoji}</span>
              <span style={{ fontWeight: 600 }}>{preset.label}</span>
            </div>
            <div style={{ 
              fontSize: '9px', 
              color: 'rgba(255,255,255,0.5)',
              lineHeight: '1.3'
            }}>
              {preset.description}
            </div>
          </button>
        ))}
      </div>
      
      {/* Подсказка для текущего пресета */}
      <div style={{
        marginTop: '8px',
        padding: '8px 10px',
        borderRadius: '8px',
        background: 'rgba(255,200,120,0.08)',
        border: '1px solid rgba(255,200,120,0.15)',
        fontSize: '9px',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: '1.4'
      }}>
        {lightingPreset === 'studio' && (
          <>
            <strong style={{ color: 'rgba(255,200,120,0.9)' }}>Студийное освещение:</strong> Трехточечная схема с мягкими тенями. Идеально для презентаций.
          </>
        )}
        {lightingPreset === 'architectural' && (
          <>
            <strong style={{ color: 'rgba(255,200,120,0.9)' }}>Архитектурное освещение:</strong> Реалистичное солнце с динамикой времени суток. Используйте настройку "Время суток" ниже.
          </>
        )}
        {lightingPreset === 'exhibition' && (
          <>
            <strong style={{ color: 'rgba(255,200,120,0.9)' }}>Выставочное освещение:</strong> Максимальная яркость без резких теней. Стиль "playful & vibrant".
          </>
        )}
        {lightingPreset === 'custom' && (
          <>
            <strong style={{ color: 'rgba(255,200,120,0.9)' }}>Базовое освещение:</strong> Оригинальная простая схема. Минимальная нагрузка на GPU.
          </>
        )}
      </div>
    </div>
  )
}

export default LightingPresetSelector
