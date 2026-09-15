import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { MOCK_USERS } from "../data/mockData";

/**
 * Интерфейс контекста авторизации
 */
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (login: string, password: string) => {
        success: boolean;
        message: string;
        blockedUser?: User;
    };
    register: (userData: Partial<User>) => { success: boolean; message: string };
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    deleteAccount: () => void;
    hasCompleteProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Провайдер авторизации
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Загружаем пользователя из localStorage при монтировании
    useEffect(() => {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    /**
     * Проверка, что профиль заполнен полностью (паспорт, СНИЛС, ИНН)
     */
    const hasCompleteProfile = !!(
        user &&
        user.passport &&
        user.snils &&
        user.tin
    );

    /**
 * Авторизация
 */
    const login = (login: string, password: string) => {
        const foundUser = MOCK_USERS.find(
            (u) => u.login === login && u.password === password
        );

        if (!foundUser) {
            return { success: false, message: "Неверный логин или пароль" };
        }

        // ✅ Проверка блокировки
        if (foundUser.isBlocked) {
            return {
                success: false,
                message: "BLOCKED", // ← специальный код для обработки
                blockedUser: foundUser,
            };
        }

        setUser(foundUser);
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        return { success: true, message: "Вход выполнен успешно" };
    };

    /**
     * Регистрация
     */
    const register = (userData: Partial<User>) => {
        const exists = MOCK_USERS.find((u) => u.login === userData.login);
        if (exists) {
            return { success: false, message: "Пользователь с таким логином уже существует" };
        }

        const newUser: User = {
            id: MOCK_USERS.length + 1,
            login: userData.login || "",
            password: userData.password || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            secondName: userData.secondName || "",
            firstName: userData.firstName || "",
            surName: userData.surName || "",
            role: "user",
            createdAt: new Date().toISOString().split("T")[0],
            lastSeen: ""
        };

        MOCK_USERS.push(newUser);
        setUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        return { success: true, message: "Регистрация прошла успешно" };
    };

    /**
     * Выход
     */
    const logout = () => {
        setUser(null);
        localStorage.removeItem("currentUser");
    };

    /**
     * Обновление профиля
     */
    const updateUser = (userData: Partial<User>) => {
        if (!user) return;

        const updated = { ...user, ...userData };
        setUser(updated);

        // Обновляем в моковом массиве
        const index = MOCK_USERS.findIndex((u) => u.id === user.id);
        if (index !== -1) {
            MOCK_USERS[index] = updated;
        }

        localStorage.setItem("currentUser", JSON.stringify(updated));
    };

    /**
     * Удаление аккаунта
     */
    const deleteAccount = () => {
        if (!user) return;

        const index = MOCK_USERS.findIndex((u) => u.id === user.id);
        if (index !== -1) {
            MOCK_USERS.splice(index, 1);
        }

        setUser(null);
        localStorage.removeItem("currentUser");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isAdmin: user?.role === "admin",
                login,
                register,
                logout,
                updateUser,
                deleteAccount,
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