/**
 * 
 */
const AVAILABLE_MODES = ['dark', 'light', 'system'];

/**
 * 
 */
class ThemeMode {

    /**
     * 
     */
    constructor() {
        this.element = null;
        this.init();
    }

    /**
     * 
     * @returns 
     */
    getMode = () => {
        const default_mode = 'light';
        const mode_param = this.getParamName('value');

        if (!localStorage) {
            return default_mode;
        }
        const current_mode = localStorage.getItem(mode_param);

        if (current_mode) {
            return current_mode;
        }
        const data_theme = this.element?.getAttribute('data-theme');

        if (data_theme) {
            return data_theme;
        }
    }

    /**
     * 
     * @param {*} postfix 
     * @returns 
     */
    getParamName = (postfix) => {
        const kt_Name = document.body.hasAttribute('data-kt-name');
        const name = kt_Name ? kt_Name + '_' : '';
        return 'kt_' + name + 'theme_mode_' + postfix;
    }

    /**
     * 
     * @returns 
     */
    getSystemMode = () => {
        return window.matchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light';
    }

    /**
     * 
     */
    init = () => {
        this.element = document.documentElement;
        this.setMode(this.getMode());
    }

    /**
     * 
     * @param {*} mode 
     * @returns 
     */
    setMode = (mode) => {
        // Check input values
        if (!AVAILABLE_MODES.includes(mode)) {
            return;
        }
        // Get param names
        const mode_param = this.getParamName('value');

        // if mode == system set mode according to system mode
        if (mode === 'system') {
            mode = this.getSystemMode()
        }
        // Set mode to the target element
        this.element?.setAttribute('data-theme', mode);

        // Store mode value in storage
        if (localStorage) {
            localStorage.setItem(mode_param, mode);
        }
    }
}

const ThemeModeComponent = new ThemeMode();
// Initialize app on document ready => ThemeModeComponent.init()
export {ThemeModeComponent};
