import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import App from './App';

import 'bootstrap/dist/css/bootstrap.css';

import './styles/root.css';
import './styles/colors.css';
import './styles/display.css';
import './styles/font.css';
import './styles/margin.css';
import './styles/padding.css';
import './styles/size.css';
import './styles/borders.css';
import './styles/text.css';
import './styles/form.css';
import './styles/table.css';
import './styles/chip.css';
import './styles/personal.css';

import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import FullscreenModeProvider from './components/contexts/FullscreenModeProvider';
import DataProvider from './components/contexts/DataProvider';
import SidebarProvider from './components/contexts/SidebarProvider';
import LoadingSpinnerProvider from './components/contexts/LoadingSpinnerProvider';
import UserInfosProvider from './pages/account/components/contexts/UserInfosProvider';
import ThemeModeProvider from './components/contexts/ThemeModeProvider';

import reportWebVitals from './reportWebVitals';

/**
 * 
 */
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

/**
 * 
 */
root.render(
    <React.StrictMode>
        <LoadingSpinnerProvider>
            <I18nextProvider i18n={i18n}>
                <ThemeModeProvider>
                    <UserInfosProvider>
                        <DataProvider>
                            <SidebarProvider>
                                <FullscreenModeProvider>
                                    <App />
                                </FullscreenModeProvider>
                            </SidebarProvider>
                        </DataProvider>
                    </UserInfosProvider>
                </ThemeModeProvider>
            </I18nextProvider>
        </LoadingSpinnerProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
