import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

/**
 * Hook to track user location
 * In production, integrate with indoor positioning system
 */
export function useGeolocation(enabled: boolean = true) {
  const setUserLocation = useAppStore(state => state.setUserLocation)
  
  useEffect(() => {
    if (!enabled) return
    
    // Try to use browser geolocation API
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          // Convert GPS coordinates to venue coordinates
          // This requires calibration with venue coordinate system
          const venueCoords = gpsToVenueCoordinates(
            position.coords.latitude,
            position.coords.longitude
          )
          
          setUserLocation({
            position: venueCoords,
            rotation: 0, // Calculate from heading if available
            timestamp: new Date()
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
      
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [enabled, setUserLocation])
}

/**
 * Convert GPS coordinates to venue coordinate system
 * This needs to be calibrated for the specific venue
 */
function gpsToVenueCoordinates(
  latitude: number,
  longitude: number
): [number, number, number] {
  // Example calibration (replace with actual venue data)
  const venueCenterLat = 55.7558 // Moscow coordinates example
  const venueCenterLon = 37.6173
  const scale = 100000 // meters to venue units
  
  const x = (longitude - venueCenterLon) * scale
  const z = (latitude - venueCenterLat) * scale
  
  return [x, 0, z]
}
