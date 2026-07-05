/**
 * Downscale a picked image File to a JPEG data URL, capped to `maxDim` on its
 * longest side. Keeps proof-photo payloads small enough to POST over a shaky
 * mobile connection (a raw camera shot can be several MB); the backend also
 * scales down as a second line of defence.
 */
export async function fileToDownscaledDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.7,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('image decode failed'))
    el.src = dataUrl
  })

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl // Fallback: original data URL if canvas is unavailable.

  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}
