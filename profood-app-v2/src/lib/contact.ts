export const WHATSAPP_NUMBER = '221787112929'
export const WHATSAPP_DISPLAY = '78 711 29 29'

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
