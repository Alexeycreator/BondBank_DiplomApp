import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@flaticon/flaticon-uicons/css/all/all.css';
import App from './App';
import keycloak from './keycloak';

keycloak.init({ 
    onLoad: 'check-sso', 
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256'
}).then(() => {
    // Рендерим только когда Keycloak точно знает, авторизован пользователь или нет
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}).catch((error) => {
    console.error("Ошибка Keycloak:", error);
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(<React.StrictMode><App /></React.StrictMode>);
});