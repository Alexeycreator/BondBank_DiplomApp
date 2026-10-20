import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost:8080', // Адрес вашего Keycloak
    realm: 'bondbank',             // Ваш реалм
    clientId: 'bondBank-webapi',   // Client ID из Keycloak
});

export default keycloak;