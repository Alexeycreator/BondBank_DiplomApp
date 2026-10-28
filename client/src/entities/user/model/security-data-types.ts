export interface PassportDto {
    id: number;
    series: number;
    number: number;
    issuedBy: string;
    dateOfIssue: string;
    departmentCode: string;
    gender: number;
    dateOfBirth: string;
    placeOfBirth: string;
}

export interface SnilsDto {
    id: number;
    number: string;
    registrationDate: string | null;
}

export interface PassportRequestDto {
    series: number;
    number: number;
    issuedBy: string;
    dateOfIssue: string;
    departmentCode: string;
    gender: number;
    dateOfBirth: string;
    placeOfBirth: string;
}

export interface SnilsRequestDto {
    number: string;
    registrationDate: string | null;
}
