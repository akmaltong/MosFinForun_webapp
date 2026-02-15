import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'

export default function ARView() {
  const setArMode = useAppStore(state => state.setArMode)
  const currentRoute = useAppStore(state => state.currentRoute)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    // Request camera access
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Camera access error:', err)
        alert('Не удалось получить доступ к камере. AR режим недоступен.')
        setArMode(false)
      }
    }
    
    startCamera()
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [setArMode])
  
  // Draw AR overlay
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationFrame: number
    
    const drawAROverlay = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (currentRoute) {
        // Draw arrow pointing to destination
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const arrowLength = 150
        
        // Animated arrow
        const time = Date.now() / 500
        const offset = (Math.sin(time) + 1) * 20
        
        ctx.save()
        ctx.translate(centerX, centerY + 100)
        
        // Arrow shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 5
        
        // Arrow body
        ctx.beginPath()
        ctx.moveTo(0, offset)
        ctx.lineTo(0, arrowLength + offset)
        ctx.strokeStyle = '#00ccff'
        ctx.lineWidth = 10
        ctx.lineCap = 'round'
        ctx.stroke()
        
        // Arrow head
        ctx.beginPath()
        ctx.moveTo(-30, arrowLength - 30 + offset)
        ctx.lineTo(0, arrowLength + offset)
        ctx.lineTo(30, arrowLength - 30 + offset)
        ctx.strokeStyle = '#00ccff'
        ctx.lineWidth = 10
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.stroke()
        
        ctx.restore()
        
        // Distance info
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(centerX - 100, centerY - 150, 200, 60)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Идите прямо', centerX, centerY - 125)
        
        ctx.font = '16px sans-serif'
        ctx.fillText(`${currentRoute.distance}м`, centerX, centerY - 105)
      } else {
        // No route - show hint
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(canvas.width / 2 - 150, 50, 300, 80)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Выберите место назначения,', canvas.width / 2, 80)
        ctx.fillText('чтобы включить AR-навигацию', canvas.width / 2, 105)
      }
      
      animationFrame = requestAnimationFrame(drawAROverlay)
    }
    
    drawAROverlay()
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [currentRoute])
  
  return (
    <div className="absolute inset-0 bg-black">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* AR overlay canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <button
          onClick={() => setArMode(false)}
          className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium shadow-lg hover:bg-gray-800 transition-colors"
        >
          ← Назад к карте
        </button>
        
        <div className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium shadow-lg">
          📱 AR Режим
        </div>
      </div>
      
      {/* Compass */}
      <div className="absolute top-20 right-4">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-full p-4 shadow-lg">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 flex items-center justify-center text-red-500 text-2xl font-bold">
              N
            </div>
            <svg className="w-full h-full" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="32" y1="32" x2="32" y2="8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
