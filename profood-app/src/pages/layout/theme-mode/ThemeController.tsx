import React, { useEffect, useState } from "react";

import { IonIcon, IonToggle } from '@ionic/react';

import { useTranslation } from "react-i18next";

import { ThemeModeComponent } from "./ThemeMode";
import { useThemeModeContext } from "../../../contexts/ThemeModeProvider";
import { SunIconString } from "../../../components/icons/svg/SunIcon";
import { MoonIconString } from "../../../components/icons/svg/MoonIcon";

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
    const { t } = useTranslation();

    /**
     * 
     */
    const [mode, setMode] = useState<ModeType>(ThemeModeComponent.getMode());

    /**
     * 
     */
    const { setThemeMode } = useThemeModeContext();

    useEffect(() => {
        // Store mode value in storage
        if(localStorage) {
            ThemeModeComponent.setMode(mode);
            ThemeModeComponent.init();
        }
    }, [mode]);

    return (
        <IonToggle
            aria-label="Mode sombre"
            labelPlacement="start"
            checked={mode === 'dark'}
            id='themeModeToggler'
            className="content-color"
            onIonChange={() => {
                const t_mode = mode !== 'dark' ? 'dark' : 'light';
                setMode(t_mode);
                setThemeMode(t_mode);
            }}
        >
           {t('Mode Sombre')}
            <IonIcon
                slot="icon-only"
                icon={(mode === 'dark' ? SunIconString : MoonIconString)}>
            </IonIcon>
        </IonToggle>

    );
};

export default ThemeController;
