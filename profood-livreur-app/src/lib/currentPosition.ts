// Tiny pub/sub for the livreur's latest known GPS fix. Filled by
// tracking.ts on each report tick and consumed by useCurrentPosition so
// the delivery list can reorder by distance without re-prompting for
// location.

type Position = [number, number]
type Listener = (pos: Position | null) => void

let latest: Position | null = null
const listeners = new Set<Listener>()

export function setCurrentPosition(pos: Position | null): void {
  latest = pos
  for (const l of listeners) l(pos)
}

export function getCurrentPosition(): Position | null {
  return latest
}

export function subscribeCurrentPosition(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
