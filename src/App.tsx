import { useState, useEffect } from 'react'
import Scene3D from './components/Scene3D'
import UIOverlay from './components/UIOverlay'
import StoreInitializer from './components/StoreInitializer'
import { useEventNotifications } from './hooks/useEventNotifications'

function App() {
  // Enable event notifications
  useEventNotifications()
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Start fade out animation
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 800)

    // Remove loading screen after fade out
    const removeTimer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (isLoading) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center transition-opacity duration-500" 
        style={{ 
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%)',
          opacity: fadeOut ? 0 : 1,
        }}
      >
        <div className="text-center">
          {/* Logo/Icon container */}
          <div 
            className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              backgroundColor: 'rgba(40, 40, 40, 0.6)',
              backdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%) brightness(0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Spinning ring */}
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{
                border: '3px solid transparent',
                borderTopColor: 'rgba(212,175,55,0.8)',
                borderRightColor: 'rgba(212,175,55,0.4)',
                animation: 'spin 1.5s linear infinite',
              }}
            />
            
            {/* Logo image */}
            <img 
              src="/logo.ico" 
              alt="SDVT Logo" 
              className="w-16 h-16 object-contain"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Loading text */}
          <div 
            className="text-lg font-semibold mb-2"
            style={{
              background: 'linear-gradient(90deg, #8B7355 0%, #D4AF37 25%, #F4E8C1 50%, #D4AF37 75%, #8B7355 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            Загрузка
          </div>
          
          {/* Subtitle */}
          <div className="text-xs text-gray-500 font-medium tracking-wide">
            МФФ 3D Навигация
          </div>

          {/* Loading dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(212,175,55,0.6)',
                  animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: translateY(0);
              opacity: 0.4;
            }
            40% { 
              transform: translateY(-8px);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative" style={{ background: '#0a0a0f' }}>
      <StoreInitializer />
      <Scene3D />
      <UIOverlay />
    </div>
  )
}

export default App
