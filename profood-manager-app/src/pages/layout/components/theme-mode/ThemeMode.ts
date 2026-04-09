/**
 * 
 */
type Mode = 'light' | 'dark';

/**
 * 
 */
class ThemeMode {
    /**
     * 
     */
    element : HTMLElement | null = null;

    /**
     * 
     * @returns 
     */
    public getMode = () : Mode => {
        const default_mode = 'dark';
        const mode_param : string = this.getParamName('value');

        if (!localStorage) {
            return default_mode;
        }
        const current_mode = localStorage.getItem(mode_param);

        if (current_mode) {
            return current_mode as Mode;
        }
        const data_theme = this.element?.getAttribute('data-theme');

        if (data_theme) {
            return data_theme as Mode;
        }

        return default_mode as Mode;
    }

    /**
     * 
     * @param postfix 
     * @returns 
     */
    private getParamName = (postfix : string) : string => {
        const app_name = document.body.hasAttribute('data-app-name');
        const name = app_name ? app_name + '_' : '';
        return 'mp_' + name + 'theme_mode_' + postfix; // mp = abbreviation de mediapex
    }

    /**
     * 
     * @param mode 
     * @returns 
     */
    public setMode = (mode : Mode) : void => {
        // Check input values
        if (mode !== 'light' && mode !== 'dark') {
            return;
        }


        // Get param names
        const mode_param : string = this.getParamName('value');

        // checks if the current mode was changed
        if (mode_param !== mode) {
            // Set mode to the target element
            this.element?.setAttribute('data-theme', mode);
            this.element?.setAttribute('data-bs-theme', mode);

            // document.body.classList.toggle("dark");

            if(mode === 'light'){
                document.body.classList.remove("dark");
            }
            else {
                document.body.classList.add("dark");
            }

            // Store mode value in storage
            if (localStorage) {
                localStorage.setItem(mode_param, mode);
            }
        }
    }

    /**
     * 
     */
    public init = () => {
        this.element = document.documentElement;
        this.setMode(this.getMode());
    }
}

const ThemeModeComponent = new ThemeMode();
// Initialize app on document ready => ThemeModeComponent.init()
export { ThemeModeComponent };
