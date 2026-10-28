export interface News {
    id: number;
    category: string;
    date: string;
    title: string;
    image: string | null;
    body: string;
}

export interface NewsRequestDto {
    category: string;
    title: string;
    image: string | null;
    body: string;
    date: string | null;
}

export interface SaveNewsResponseDto {
    id: number;
    message: string;
}
