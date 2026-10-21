import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import keycloak from "../../keycloak";
import { usersApi } from "../data/usersApi";

interface AuthContextType {
    user: any | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    hasCompleteProfile: boolean;
    logout: () => void;
    login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(keycloak.tokenParsed || null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!keycloak.authenticated);
    const [isAdmin, setIsAdmin] = useState<boolean>(
        keycloak.tokenParsed?.realm_access?.roles?.includes("admin") || false
    );

    useEffect(() => {
        if (keycloak.authenticated) {
            usersApi.sendHeartbeat().catch(console.error);
        }

        keycloak.onAuthSuccess = () => {
            setUser(keycloak.tokenParsed);
            setIsAuthenticated(true);
            setIsAdmin(keycloak.tokenParsed?.realm_access?.roles?.includes("admin") || false);
            usersApi.sendHeartbeat().catch(console.error);
        };

        keycloak.onAuthLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        };
    }, []);

    // ✅ Запоминаем текущую страницу для возврата
    const login = () => {
        keycloak.login({ redirectUri: window.location.href });
    };

    const logout = () => keycloak.logout({ redirectUri: window.location.origin });

    const hasCompleteProfile = isAuthenticated && !!user?.email;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, hasCompleteProfile, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};