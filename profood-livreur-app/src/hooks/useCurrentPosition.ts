import { useEffect, useState } from 'react'
import {
  getCurrentPosition,
  subscribeCurrentPosition,
} from '../lib/currentPosition'

export function useCurrentPosition(): [number, number] | null {
  const [pos, setPos] = useState(() => getCurrentPosition())

  useEffect(() => {
    return subscribeCurrentPosition(setPos)
  }, [])

  return pos
}
