import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export default function NotificationBar() {
  const notifications = useAppStore(state => state.notifications)
  const removeNotification = useAppStore(state => state.removeNotification)
  
  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications, removeNotification])
  
  if (notifications.length === 0) return null
  
  const notification = notifications[0]
  
  const getIcon = () => {
    switch (notification.type) {
      case 'event': return '📅'
      case 'navigation': return '🧭'
      case 'friend': return '👤'
      default: return 'ℹ️'
    }
  }
  
  const getColor = () => {
    switch (notification.type) {
      case 'event': return 'from-blue-600 to-purple-600'
      case 'navigation': return 'from-green-600 to-teal-600'
      case 'friend': return 'from-orange-600 to-red-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }
  
  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 pointer-events-auto z-50">
      <div 
        className={`bg-gradient-to-r ${getColor()} text-white rounded-xl p-4 shadow-2xl transform transition-all animate-slide-in`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">{getIcon()}</div>
          <div className="flex-1">
            <h4 className="font-bold mb-1">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
