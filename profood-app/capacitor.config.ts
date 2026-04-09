import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.profoodapp.app',
    appName: 'Profood',
    webDir: 'build',
    bundledWebRuntime: false,
    plugins: {
        SplashScreen: {
            launchShowDuration: 1200,
            launchAutoHide: true,
            launchFadeOutDuration: 1200,
            // backgroundColor: "#ffffffff",
            androidSplashResourceName: "splash",
            androidScaleType: "CENTER_CROP",
            showSpinner: false,
            //   androidSpinnerStyle: "large",
            //   iosSpinnerStyle: "small",
            //   spinnerColor: "#999999",
            splashFullScreen: true,
            splashImmersive: false,
            layoutName: "launch_screen",
            useDialog: false
        },
    },
};

export default config;
