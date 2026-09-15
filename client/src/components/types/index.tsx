/**
 * Роль пользователя
 */
export type UserRole = "admin" | "user";

/**
 * Тип облигации
 */
export type BondType = "lse" | "wb" | "sg" | "me";

/**
 * Модель облигации
 */
export interface Bond {
    id: number;
    name: string;
    isin: string;
    type: BondType;
    price: number;
    yield: number;
    maturity: string;
    currency: string;
    currencyRate: number;
    updatedAt: string;
}

/**
 * Паспортные данные
 */
export interface PassportData {
    series: string;
    number: string;
    issuedBy: string;
    dateOfIssue: string;
    departmentCode: string;
}

/**
 * СНИЛС
 */
export interface SnilsData {
    number: string;
    registrationDate: string;
}

/**
 * Модель пользователя
 */
export interface User {
    id: number;
    login: string;
    password: string;
    email: string;
    phoneNumber: string;
    secondName: string;
    firstName: string;
    surName?: string;
    role: UserRole;
    tin?: string;
    passport?: PassportData;
    snils?: SnilsData;
    createdAt: string;
    lastSeen: string;
    isBlocked?: boolean;
    blockedBy?: string;
    blockedAt?: string;
}

/**
 * Новость
 */
export interface News {
    id: number;
    title: string;
    content: string;
    author: string;
    date: string;
    category: string;
}

export interface Portfolio {
    id: number;
    userId: number;         // ← владелец портфеля
    name: string;
    description?: string;
    type: PortfolioType;
    currentValue: number;
    currentYield: number;
    createdAt: string;
}

export type PortfolioType = "conservative" | "aggressive" | "balanced";