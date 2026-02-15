import { useAppStore } from '../store/appStore'

export default function AdjustmentsPanel() {
  const store = useAppStore()
  const setActiveBottomPanel = useAppStore(state => state.setActiveBottomPanel)
  const isBaked = store.lightingMode === 'baked'

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

      <div style={{ maxWidth: '700px', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Окружение
            </div>

            {/* Lighting Mode: Sky / Baked */}
            <div className="flex gap-2 mb-3">
              {(['sky', 'baked'] as const).map((mode) => {
                const isActive = store.lightingMode === mode
                const label = mode === 'sky' ? 'Небо' : 'Baked'
                return (
                  <button
                    key={mode}
                    onClick={() => store.setLightingMode(mode)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'white',
                      background: isActive ? 'rgba(255,200,120,0.2)' : 'rgba(255,255,255,0.05)',
                      border: isActive ? '1px solid rgba(255,200,120,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: '0.2s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
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

            {/* === Baked mode sliders === */}
            {isBaked && (
              <>
                {/* Lightmap Intensity */}
                <Slider label="Карта света" value={store.lightmapIntensity} min={0} max={3.0} step={0.1}
                  onChange={(v) => store.setLightmapIntensity(v)} />

                {/* Ambient brightness */}
                <Slider label="Яркость" value={store.hdriIntensity} min={0.1} max={2.0} step={0.05}
                  onChange={(v) => store.setHdriIntensity(v)} />

                {/* Exposure */}
                <Slider label="Экспозиция" value={store.toneMappingExposure} min={0.3} max={2.0} step={0.05}
                  onChange={(v) => store.setToneMappingExposure(v)} />

                {/* AO */}
                <Slider label="Интенсивность AO" value={store.aoIntensity} min={0} max={5.0} step={0.1}
                  onChange={(v) => store.setAoIntensity(v)} />

                {/* Roughness */}
                <Slider label="Шероховатость" value={store.materialRoughness} min={0} max={1.0} step={0.05}
                  onChange={(v) => store.setMaterialRoughness(v)} />

                {/* Metalness */}
                <Slider label="Металличность" value={store.materialMetalness} min={0} max={1.0} step={0.05}
                  onChange={(v) => store.setMaterialMetalness(v)} />
              </>
            )}

            {/* === Sky mode sliders === */}
            {!isBaked && (
              <>
                {/* Brightness */}
                <Slider label="Яркость" value={store.hdriIntensity} min={0.3} max={2.0} step={0.05}
                  onChange={(v) => {
                    store.setHdriIntensity(v)
                    if (store.hdriFile === 'textures/env/kloppenheim_06_puresky_1k.hdr') {
                      store.setSkyIntensity(v)
                    }
                  }} />

                {/* AO */}
                <Slider label="Интенсивность AO" value={store.aoIntensity} min={0} max={5.0} step={0.1}
                  onChange={(v) => store.setAoIntensity(v)} />

                {/* Metalness */}
                <Slider label="Металличность" value={store.materialMetalness} min={0} max={1.0} step={0.05}
                  onChange={(v) => store.setMaterialMetalness(v)} />

                {/* Roughness */}
                <Slider label="Шероховатость" value={store.materialRoughness} min={0} max={1.0} step={0.05}
                  onChange={(v) => store.setMaterialRoughness(v)} />

                {/* Env Map Intensity */}
                <Slider label="Интенсивность отражений" value={store.envMapIntensity} min={0} max={3.0} step={0.1}
                  onChange={(v) => store.setEnvMapIntensity(v)} />

                {/* Exposure */}
                <Slider label="Экспозиция" value={store.toneMappingExposure} min={0.1} max={2.0} step={0.05}
                  onChange={(v) => store.setToneMappingExposure(v)} />

                {/* Blur and Rotation */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: '1 1 0%' }}>
                    <SliderInline label="Размытие" value={store.hdriBlur} min={0} max={0.5} step={0.05}
                      onChange={(v) => {
                        store.setHdriBlur(v)
                        if (store.hdriFile === 'textures/env/kloppenheim_06_puresky_1k.hdr') {
                          store.setSkyBlur(v)
                        }
                      }} />
                  </div>
                  <div style={{ flex: '1 1 0%' }}>
                    <SliderInline label="Вращение" value={store.hdriRotation} min={0} max={360} step={5}
                      onChange={(v) => store.setHdriRotation(v)} suffix="°" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable slider component
function Slider({ label, value, min, max, step, onChange, suffix }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
          {suffix ? `${Math.round(value)}${suffix}` : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="settings-slider"
      />
    </div>
  )
}

function SliderInline({ label, value, min, max, step, onChange, suffix }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontSize: '9px', color: 'rgba(255,200,120,0.5)', fontFamily: 'monospace' }}>
          {suffix ? `${Math.round(value)}${suffix}` : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="settings-slider"
      />
    </>
  )
}
