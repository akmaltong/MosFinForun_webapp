export interface Zone {
  id: string
  name: string
  color: string
  position: [number, number, number]
  description: string
  type: 'conference' | 'exhibition' | 'food' | 'registration' | 'lounge' | 'other'
  poi?: POI
  floor?: string
  equipment?: string[]
  capacity?: number
}

export interface POI {
  cameraPosition: [number, number, number]
  targetPosition: [number, number, number]
  distance?: number
  azimuthDeg?: number
  elevationDeg?: number
}

export interface POICamera {
  id: string
  name: string
  color: string
  cameraPosition: [number, number, number]
  targetPosition: [number, number, number]
  description: string
  distance?: number
  azimuthDeg?: number
  elevationDeg?: number
}

export interface Event {
  id: string
  title: string
  description: string
  zoneId: string
  startTime: Date
  endTime: Date
  status: 'upcoming' | 'ongoing' | 'completed'
  tags: string[]
  speakers?: string[]
  capacity?: number
}

export interface UserLocation {
  position: [number, number, number]
  rotation: number
  timestamp: Date
}

export interface Friend {
  id: string
  name: string
  avatar?: string
  location: UserLocation
  isOnline: boolean
}

export interface Route {
  from: [number, number, number]
  to: [number, number, number]
  waypoints: [number, number, number][]
  distance: number
  estimatedTime: number
}

export interface Notification {
  id: string
  type: 'event' | 'navigation' | 'friend' | 'general'
  title: string
  message: string
  timestamp: Date
  eventId?: string
  zoneId?: string
}

export type ViewMode = 'top' | 'angle' | 'first-person'
export type UIPanel = 'events' | 'zones' | 'friends' | 'favorites' | 'menu' | 'settings' | null
