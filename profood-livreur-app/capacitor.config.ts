import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.profoodapp.livreur',
    appName: 'Profood Livreur',
    webDir: 'dist',
    plugins: {
        SplashScreen: {
            launchShowDuration: 1200,
            launchAutoHide: true,
            launchFadeOutDuration: 600,
            backgroundColor: '#ffffffff',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: false,
        },
    },
}

export default config
