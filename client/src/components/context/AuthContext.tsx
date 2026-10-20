import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import keycloak from "../../keycloak";

/**
 * Интерфейс контекста авторизации
 */
interface AuthContextType {
    user: any | null; // Данные из токена Keycloak
    isAuthenticated: boolean;
    isAdmin: boolean;
    logout: () => void;
    hasCompleteProfile: boolean; // Оставляем, если нужно проверять профиль
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Провайдер авторизации
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // При монтировании проверяем, авторизован ли пользователь в Keycloak
    useEffect(() => {
        if (keycloak.authenticated) {
            setIsAuthenticated(true);
            setUser(keycloak.tokenParsed);

            // ✅ Проверяем роль admin из токена Keycloak
            const roles = keycloak.tokenParsed?.realm_access?.roles || [];
            setIsAdmin(roles.includes('admin'));
        }
    }, []);

    // ✅ В вашей логике hasCompleteProfile проверяет наличие паспорта, СНИЛС и ИНН.
    // Теперь эти данные можно проверять либо из токена (если вы их туда кладете),
    // либо через запрос к вашему API (который знает, заполнен ли профиль).
    // Пока для примера сделаем заглушку (или проверку по наличию email).
    const hasCompleteProfile = !!user?.email; 

    /**
     * Выход (перенаправляет на страницу логина Keycloak и выходит)
     */
    const logout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isAdmin,
                logout,
                hasCompleteProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Хук для использования контекста авторизации
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};