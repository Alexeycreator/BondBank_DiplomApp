import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { KeycloakTokenParsed } from "keycloak-js";
import keycloak from "../../keycloak";
import { api } from "../api/client";

export type AuthUser = KeycloakTokenParsed & {
    sub?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
    id?: string | number;
    login?: string;
};

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    hasCompleteProfile: boolean;
    logout: () => void;
    login: () => void;
    register: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(
        (keycloak.tokenParsed as AuthUser | undefined) || null,
    );
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!keycloak.authenticated);
    const [isAdmin, setIsAdmin] = useState<boolean>(
        keycloak.tokenParsed?.realm_access?.roles?.includes("admin") || false,
    );

    useEffect(() => {
        if (keycloak.authenticated) {
            api.post("/Users/heartbeat").catch(console.error);
        }

        keycloak.onAuthSuccess = () => {
            const tokenUser = keycloak.tokenParsed as AuthUser | undefined;
            setUser(tokenUser || null);
            setIsAuthenticated(true);
            setIsAdmin(tokenUser?.realm_access?.roles?.includes("admin") || false);
            api.post("/Users/heartbeat").catch(console.error);
        };

        keycloak.onAuthLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        };
    }, []);

    const login = () => {
        keycloak.login({ redirectUri: window.location.href });
    };

    const register = () => {
        keycloak.register({ redirectUri: window.location.href });
    };

    const logout = () => keycloak.logout({ redirectUri: window.location.origin });

    const hasCompleteProfile = isAuthenticated && !!user?.email;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, hasCompleteProfile, logout, login, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
