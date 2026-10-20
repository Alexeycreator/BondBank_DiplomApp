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
    pkceMethod: 'S256'
}).then((authenticated) => {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}).catch((error) => {
    console.error("Ошибка при инициализации Keycloak:", error);
    // Даже если Keycloak упал, лучше отрисовать приложение (например, с ошибкой)
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(<div>Ошибка подключения к серверу авторизации</div>);
});