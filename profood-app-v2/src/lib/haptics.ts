/**
 * Retour haptique — fin vernis « natif ». Import dynamique de Capacitor pour
 * que le web (où le plugin n'existe pas / est un no-op) ne casse jamais.
 */
type Style = 'light' | 'medium' | 'heavy'

export async function haptic(style: Style = 'light'): Promise<void> {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy }
    await Haptics.impact({ style: map[style] })
  } catch {
    /* pas de natif (dev navigateur) : silencieux */
  }
}
