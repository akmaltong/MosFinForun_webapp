import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { shouldNotifyForEvent, createEventNotification } from '../utils/notifications'

/**
 * Hook to manage event notifications
 */
export function useEventNotifications() {
  const events = useAppStore(state => state.events)
  const favoriteEvents = useAppStore(state => state.favoriteEvents)
  const addNotification = useAppStore(state => state.addNotification)
  
  const notifiedEventsRef = useRef(new Set<string>())
  
  useEffect(() => {
    // Check every minute for upcoming events
    const interval = setInterval(() => {
      events.forEach(event => {
        // Only notify for favorite events or all events
        const shouldCheck = favoriteEvents.includes(event.id) // || true for all events
        
        if (shouldCheck && shouldNotifyForEvent(event, notifiedEventsRef.current)) {
          addNotification(createEventNotification(event))
        }
      })
    }, 60000) // Check every minute
    
    // Initial check
    events.forEach(event => {
      const shouldCheck = favoriteEvents.includes(event.id)
      if (shouldCheck && shouldNotifyForEvent(event, notifiedEventsRef.current)) {
        addNotification(createEventNotification(event))
      }
    })
    
    return () => clearInterval(interval)
  }, [events, favoriteEvents, addNotification])
}
