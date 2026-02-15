import type { Notification, Event } from '../types'
import { differenceInMinutes } from 'date-fns'

/**
 * Create notification for upcoming event
 */
export function createEventNotification(event: Event): Notification {
  const minutesToStart = differenceInMinutes(event.startTime, new Date())
  
  let message = ''
  if (minutesToStart <= 5) {
    message = `Начинается через ${minutesToStart} минут!`
  } else if (minutesToStart <= 15) {
    message = `Начинается через ${minutesToStart} минут. Самое время отправиться.`
  } else {
    message = `Напоминание о предстоящем мероприятии.`
  }
  
  return {
    id: `notif-${event.id}-${Date.now()}`,
    type: 'event',
    title: event.title,
    message,
    timestamp: new Date(),
    eventId: event.id,
    zoneId: event.zoneId
  }
}

/**
 * Create notification for navigation
 */
export function createNavigationNotification(
  destination: string,
  distance: number,
  time: number
): Notification {
  return {
    id: `notif-nav-${Date.now()}`,
    type: 'navigation',
    title: 'Маршрут построен',
    message: `До ${destination}: ${distance}м (~${time} мин)`,
    timestamp: new Date()
  }
}

/**
 * Create notification for friend activity
 */
export function createFriendNotification(
  friendName: string,
  message: string
): Notification {
  return {
    id: `notif-friend-${Date.now()}`,
    type: 'friend',
    title: friendName,
    message,
    timestamp: new Date()
  }
}

/**
 * Check if event should trigger notification
 */
export function shouldNotifyForEvent(
  event: Event,
  notifiedEvents: Set<string>
): boolean {
  const minutesToStart = differenceInMinutes(event.startTime, new Date())
  
  // Notify 15 minutes before, 5 minutes before, and when starting
  const notificationTimes = [15, 5, 0]
  
  return notificationTimes.some(time => {
    const key = `${event.id}-${time}`
    if (notifiedEvents.has(key)) return false
    
    if (minutesToStart <= time && minutesToStart > time - 1) {
      notifiedEvents.add(key)
      return true
    }
    return false
  })
}
