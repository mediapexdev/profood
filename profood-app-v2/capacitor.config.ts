import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'sn.profood.app',
    appName: 'Profood',
    webDir: 'dist',
    plugins: {
        SplashScreen: {
            launchShowDuration: 1200,
            launchAutoHide: true,
            launchFadeOutDuration: 500,
            backgroundColor: '#221610',
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
