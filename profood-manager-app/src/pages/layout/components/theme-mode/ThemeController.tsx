import React, { useEffect, useState } from "react";

import { Button } from 'reactstrap';

import { Moon, Sun } from 'react-bootstrap-icons';

// import { useTranslation } from "react-i18next";

import { ThemeModeComponent } from "./ThemeMode";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";

/**
 * 
 */
export type ModeType = 'dark' | 'light';

/**
 * 
 * @returns 
 */
const ThemeController: React.FC= () => {
    /**
     * 
     */
    // const { t } = useTranslation();

    /**
     * 
     */
    const [mode, setMode] = useState<ModeType>(ThemeModeComponent.getMode());

    /**
     * 
     */
    const { setThemeMode } = useThemeModeContext();

    /**
     * 
     */
    useEffect(() => {
        // Store mode value in storage
        if(localStorage) {
            ThemeModeComponent.setMode(mode);
            ThemeModeComponent.init();
        }
    }, [mode]);

    return (
        <Button
            tag='button'
            type='button'
            size="sm"
            id='themeModeToggler'
            color="light"
            className="d-flex flex-center content-color w-40px h-40px"
            onClick={() => {
                const t_mode = mode !== 'dark' ? 'dark' : 'light';
                setMode(t_mode);
                setThemeMode(t_mode);
            }}
        >
           {/* {t('Mode Sombre')} */}
        {
            mode === 'dark'
            ?
            <Moon size={19} />
            :
            <Sun size={19} />
        }
        </Button>
    );
};

export default ThemeController;
