export type UserRole = "admin" | "user";

export interface PassportData {
    series: string;
    number: string;
    issuedBy: string;
    dateOfIssue: string;
    departmentCode: string;
}

export interface SnilsData {
    number: string;
    registrationDate: string;
}

export interface User {
    id: number;
    login: string;
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

export interface MockUser extends User {
    password: string;
}

export interface UserModel {
    id: number;
    secondName: string;
    firstName: string;
    surName: string;
    emailAddress: string;
    phoneNumber?: string;
    tin?: string;
    login: string;
    lastLoginAt?: string;
    passportId?: number;
    passportSeries?: string;
    passportNumber?: string;
    passportIssuedBy?: string;
    passportIssueDate?: string;
    snilsId?: number;
    keycloakId: string;
}
