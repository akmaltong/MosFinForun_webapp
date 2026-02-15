import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { zones } from '../data/mockData'

export default function StoreInitializer() {
  const setZones = useAppStore(state => state.setZones)
  const setUserLocation = useAppStore(state => state.setUserLocation)
  const currentZones = useAppStore(state => state.zones)

  useEffect(() => {
    if (currentZones.length === 0) {
      setZones(zones)

      // Set initial user location at Accreditation zone
      const accreditationZone = zones.find(z => z.name.includes('Аккредитация'))
      if (accreditationZone) {
        setUserLocation({
          position: accreditationZone.position,
          rotation: 0,
          timestamp: new Date()
        })
      }
    }
  }, [setZones, setUserLocation, currentZones.length])

  return null
}
