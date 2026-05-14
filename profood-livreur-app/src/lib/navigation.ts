import { platform } from './platform'
import type { DeliveryAddress } from '../types'

function buildAddressQuery(address: DeliveryAddress): string {
  const parts = [address.street, address.city].filter(Boolean)
  return parts.join(', ')
}

/**
 * Opens the platform's native maps app with turn-by-turn directions to the
 * given delivery address. iOS → Apple Maps. Android → default geo handler
 * (Google Maps if installed). Web fallback → google.com/maps in a new tab.
 *
 * If `coordinates` are available we prefer them — geocoding the textual
 * address again on the OS side is unreliable in Senegal.
 */
export function openDirections(address: DeliveryAddress): void {
  const query = buildAddressQuery(address)
  const coords = address.coordinates
  const hasCoords = Array.isArray(coords) && coords.length === 2

  let url: string

  if (platform === 'ios') {
    if (hasCoords) {
      url = `maps://?daddr=${coords[0]},${coords[1]}&dirflg=d`
    } else {
      url = `maps://?daddr=${encodeURIComponent(query)}&dirflg=d`
    }
  } else if (platform === 'android') {
    if (hasCoords) {
      url = `google.navigation:q=${coords[0]},${coords[1]}&mode=d`
    } else {
      url = `geo:0,0?q=${encodeURIComponent(query)}`
    }
  } else {
    const destination = hasCoords ? `${coords[0]},${coords[1]}` : query
    url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`
  }

  if (platform === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    window.location.href = url
  }
}
