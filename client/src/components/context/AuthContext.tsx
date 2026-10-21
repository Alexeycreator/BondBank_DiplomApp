import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import keycloak from "../../keycloak";
import { usersApi } from "../data/usersApi";

interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    logout: () => void;
    login: () => void; // <-- Добавили функцию для входа
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isKeycloakReady, setIsKeycloakReady] = useState<boolean>(false); // Ждем инициализации

    useEffect(() => {
        // Проверяем, инициализирован ли Keycloak
        if (keycloak.authenticated) {
            setIsKeycloakReady(true);
            updateAuthState();
        } else {
            // Если не авторизован, но Keycloak уже загружен
            setIsKeycloakReady(true);
        }

        // Слушаем события Keycloak (если токен обновится или протухнет)
        keycloak.onAuthSuccess = () => {
            updateAuthState();
        };
        keycloak.onAuthLogout = () => {
            setIsAuthenticated(false);
            setUser(null);
            setIsAdmin(false);
        };
    }, []);

    const updateAuthState = () => {
        setIsAuthenticated(true);
        setUser(keycloak.tokenParsed);

        const roles = keycloak.tokenParsed?.realm_access?.roles || [];
        setIsAdmin(roles.includes("admin"));

        const syncUserWithBackend = async () => {
            try {
                await usersApi.sendHeartbeat();
                console.log("✅ Пользователь успешно синхронизирован с БД");
            } catch (error) {
                console.error("❌ Ошибка синхронизации:", error);
            }
        };
        syncUserWithBackend();
    };

    const login = () => {
        keycloak.login({ redirectUri: window.location.origin });
    };

    const logout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    if (!isKeycloakReady) {
        return <div>Загрузка...</div>;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isAdmin,
                logout,
                login
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};