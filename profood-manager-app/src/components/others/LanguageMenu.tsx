import React, { useState } from 'react';

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle
} from 'reactstrap';

import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';

import { toAbsolutePublicUrl } from '../../helpers/AssetHelpers';

import './LanguageMenu.css';

/**
 * 
 */
interface LanguageInfo {
    name: string;
    value: string;
    flag: string;
}

/**
 * 
 * @returns 
 */
const LanguageMenu: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const languagesInfo: LanguageInfo[] = [
        {
            name: t('Anglais'),
            value: 'en',
            flag: toAbsolutePublicUrl('/assets/media/images/icons/svg/flags/united-states.svg')
        },
        {
            name: t('Français'),
            value: 'fr',
            flag: toAbsolutePublicUrl('/assets/media/images/icons/svg/flags/france.svg')
        }
    ];

    /**
     * 
     * @param value 
     * @returns 
     */
    const getLangByValue = (value: string): LanguageInfo => {
        /**
         * 
         */
        switch(value){
            case 'en':
                return languagesInfo[0];
            case 'fr':
            default:
                return languagesInfo[1];
        }
    };

    /**
     * 
     */
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

    /**
     * 
     * @param languageInfo 
     */
    const changeLanguage = (languageInfo: LanguageInfo) => {
        setDropdownOpen(false);
        i18n.changeLanguage((languageInfo.value === 'en' || languageInfo.value === 'fr') ? languageInfo.value : 'fr');
        localStorage.setItem('lang', i18n.language);
        document.documentElement.setAttribute('lang', languageInfo.value);
    };

    /**
     * 
     */
    return (
        <Dropdown
            isOpen={dropdownOpen}
            toggle={toggleDropdown}
            className='user-menu-dropdown dropdown-center'
        >
            {/* begin::dropdown toggle */}
            <DropdownToggle
                id='headerLanguageMenuToggler'
                className='menu-toggler language-menu-toggler btn-sm d-flex flex-center rounded-circle p-1 w-40px h-40px'
                color='light'
                title={t('Langue')}
            >
                <div className='flag-wrapper w-20px h-20px'>
                    <img
                        className='flag img-fluid rounded-1'
                        src={getLangByValue(i18n.language).flag}
                        alt={t(i18n.language === 'en' ? 'Drapeau français' : 'Drapeau américain')}
                    />
                </div>
                {/* <div className=''>
                    <span className=''>{i18n.language.toUpperCase()}</span>
                </div> */}
            </DropdownToggle>
            {/* end::dropdown toggle */}
            {/* begin::dropdown menu */}
            <DropdownMenu className='user-dropdown-menu'>
            {
                languagesInfo.map((language_info, index) => (
                    <DropdownItem 
                        key={index}
                        className='d-flex align-items-center gap-2'
                        onClick={() => changeLanguage(language_info)}
                    >
                        <div className='flag-wrapper d-flex flex-center w-20px h-20px'>
                            <img
                                className='flag img-fluid w-90 rounded-1'
                                src={getLangByValue(language_info.value).flag}
                                alt={t(language_info.name)}
                            />
                        </div>
                        <div className='fs-7'>
                            <span className=''>{language_info.name}</span>
                        </div>
                    </DropdownItem>
                ))
            }
            </DropdownMenu>
            {/* end::dropdown menu */}
        </Dropdown>
    );
};

export default LanguageMenu;
