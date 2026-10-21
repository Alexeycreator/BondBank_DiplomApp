import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@flaticon/flaticon-uicons/css/all/all.css';
import App from './App';
import keycloak from './keycloak';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

keycloak.init({ 
    onLoad: 'check-sso', 
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256'
}).then((authenticated) => {
    console.log("Keycloak инициализирован. Авторизован:", authenticated);
}).catch((error) => {
    console.error("Ошибка при инициализации Keycloak (сайт продолжит работу как гость):", error);
});