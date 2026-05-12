import { Capacitor } from '@capacitor/core'

/**
 * True when the JS bundle is running inside a Capacitor WebView (iOS / Android
 * native shell). False in a plain browser (e.g. `npm run dev`, PWA install).
 *
 * Use this gate before calling any native-only plugin so the web fallback
 * path stays clean and we never throw on unsupported APIs.
 */
export const isNative = Capacitor.isNativePlatform()

/**
 * 'ios' | 'android' on native, 'web' otherwise.
 */
export const platform = Capacitor.getPlatform()
