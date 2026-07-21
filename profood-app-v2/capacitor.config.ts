import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.profoodapp.app',
    appName: 'Profood',
    webDir: 'dist',
    plugins: {
        SplashScreen: {
            launchShowDuration: 1200,
            launchAutoHide: true,
            launchFadeOutDuration: 500,
            backgroundColor: '#f6f3ee',
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true,
        },
        Keyboard: {
            resize: 'native',
        },
    },
}

export default config
