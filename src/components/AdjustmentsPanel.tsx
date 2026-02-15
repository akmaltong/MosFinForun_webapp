import { useAppStore } from '../store/appStore'

export default function AdjustmentsPanel() {
  const store = useAppStore()
  const setActiveBottomPanel = useAppStore(state => state.setActiveBottomPanel)

  return (
    <div
      className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto select-none w-[95%] sm:w-auto max-w-[900px] shadow-2xl m-2"
      style={{ 
        backgroundColor: 'rgba(40, 40, 40, 0.4)',
        backdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
        borderRadius: '25px',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)',
        padding: '12px 16px',
      }}
    >
      <style>{`
        @keyframes slideUpIn {
          from { opacity: 0; transform: translate(-50%, 30px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .settings-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 10px;
          outline: none;
          background: linear-gradient(to right, rgba(255,200,120,0.15), rgba(255,200,120,0.35) 50%, rgba(255,200,120,0.15));
        }
        .settings-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #e0d8c8);
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,200,120,0.2);
          cursor: pointer;
          transition: transform 0.15s;
        }
        .settings-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .settings-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #e0d8c8);
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        }
      `}</style>

      {/* Main panel */}
      <div
        style={{
          maxWidth: '700px',
          position: 'relative',
        }}
      >
        {/* Single column layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Environment section */}
          <div>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Окружение
            </div>
            
            {/* HDRI: only Sky mode */}
            <div className="flex gap-2 mb-3">
              <button
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'white',
                  background: 'rgba(255,200,120,0.2)',
                  border: '1px solid rgba(255,200,120,0.3)',
                  cursor: 'default',
                  transition: '0.2s',
                }}
              >
                Небо
              </button>
            </div>
            
            {/* Background toggle */}
            <div className="flex items-center justify-between mb-3" style={{ gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                Фон
              </span>
              <button
                onClick={() => store.setShowHdriBackground(!store.showHdriBackground)}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  background: store.showHdriBackground 
                    ? 'rgba(255, 200, 120, 0.4)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 200, 120, 0.5)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: store.showHdriBackground ? '18px' : '3px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, rgb(255, 255, 255), rgb(240, 216, 152))',
                    transition: '0.2s',
                    boxShadow: 'rgba(255, 200, 120, 0.3) 0px 1px 4px',
                  }}
                />
              </button>
            </div>

            {/* Brightness Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Яркость
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                  {store.hdriIntensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.3}
                max={2.0}
                step={0.05}
                value={store.hdriIntensity}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value)
                  store.setHdriIntensity(newValue)
                  // Обновляем соответствующее значение для текущего HDRI
                  if (store.hdriFile === 'textures/env/neutral_HDR.jpg') {
                    store.setNeutralIntensity(newValue)
                  } else if (store.hdriFile === 'textures/env/kloppenheim_06_puresky_1k.hdr') {
                    store.setSkyIntensity(newValue)
                  }
                }}
                className="settings-slider"
              />
            </div>

            {/* AO Intensity Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Интенсивность AO
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                  {store.aoIntensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5.0}
                step={0.1}
                value={store.aoIntensity}
                onChange={(e) => store.setAoIntensity(parseFloat(e.target.value))}
                className="settings-slider"
              />
            </div>

            {/* Metalness Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Металличность
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                  {store.materialMetalness.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={store.materialMetalness}
                onChange={(e) => store.setMaterialMetalness(parseFloat(e.target.value))}
                className="settings-slider"
              />
            </div>

            {/* Roughness Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Шероховатость
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                  {store.materialRoughness.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={store.materialRoughness}
                onChange={(e) => store.setMaterialRoughness(parseFloat(e.target.value))}
                className="settings-slider"
              />
            </div>

            {/* Env Map Intensity Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Интенсивность отражений
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                  {store.envMapIntensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={3.0}
                step={0.1}
                value={store.envMapIntensity}
                onChange={(e) => store.setEnvMapIntensity(parseFloat(e.target.value))}
                className="settings-slider"
              />
            </div>

            {/* Exposure Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Экспозиция
                </span>
                <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                  {store.toneMappingExposure.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.05}
                value={store.toneMappingExposure}
                onChange={(e) => store.setToneMappingExposure(parseFloat(e.target.value))}
                className="settings-slider"
              />
            </div>

            {/* Blur and Rotation in one row */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Blur Slider */}
              <div style={{ flex: '1 1 0%' }}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Размытие
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                    {store.hdriBlur.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.5}
                  step={0.05}
                  value={store.hdriBlur}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value)
                    store.setHdriBlur(newValue)
                    // Обновляем соответствующее значение для текущего HDRI
                    if (store.hdriFile === 'textures/env/neutral_HDR.jpg') {
                      store.setNeutralBlur(newValue)
                    } else if (store.hdriFile === 'textures/env/kloppenheim_06_puresky_1k.hdr') {
                      store.setSkyBlur(newValue)
                    }
                  }}
                  className="settings-slider"
                />
              </div>

              {/* Rotation Slider */}
              <div style={{ flex: '1 1 0%' }}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Вращение фона
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
                    {Math.round(store.hdriRotation)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={store.hdriRotation}
                  onChange={(e) => store.setHdriRotation(parseFloat(e.target.value))}
                  className="settings-slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
