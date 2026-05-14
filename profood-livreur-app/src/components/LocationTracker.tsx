import { useEffect } from 'react'
import { useDeliveries } from '../hooks/useDeliveries'
import { startLocationTracking, stopLocationTracking } from '../lib/tracking'

/**
 * Headless component mounted once at the authenticated app shell.
 *
 * Watches `activeDeliveries.length` from the deliveries hook: when there
 * is at least one pending or in-progress delivery, we start periodic GPS
 * reporting; otherwise we stop. Unmount (logout) tears the interval
 * down. This is the cheap-but-sufficient tracking strategy — it spares
 * the battery on idle days while keeping the manager view live while
 * the driver is on the road.
 *
 * Renders nothing.
 */
export function LocationTracker() {
  const { activeDeliveries } = useDeliveries()
  const activeCount = activeDeliveries.length

  useEffect(() => {
    if (activeCount > 0) {
      void startLocationTracking()
    } else {
      stopLocationTracking()
    }
    return () => {
      stopLocationTracking()
    }
  }, [activeCount])

  return null
}
