import { useEffect, useRef, useState } from 'react'

/**
 * Bottom sheet natif : remonte du bas, poignée de préhension, glisser-vers-le-bas
 * pour fermer, fermeture au tap sur le fond. Verrouille le scroll d'arrière-plan.
 */
export function Sheet({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}) {
  const [dragY, setDragY] = useState(0)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY
      ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return
    const dy = e.clientY - startY.current
    if (dy > 0) setDragY(dy)
  }
  const onPointerUp = () => {
    if (dragY > 90) onClose()
    setDragY(0)
    startY.current = null
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        <div
          className="pt-1 pb-2 cursor-grab touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="sheet-handle" />
        </div>
        {title && <h2 className="px-5 pb-2 text-lg font-extrabold">{title}</h2>}
        <div className="px-5 pb-2 max-h-[70dvh] overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </>
  )
}
