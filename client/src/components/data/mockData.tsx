import { User, News } from "../types";

/**
 * Моковые пользователи
 */
export const MOCK_USERS: User[] = [
    {
        id: 1,
        login: "user1",
        password: "user1",
        email: "user1@bondbank.com",
        phoneNumber: "89123456789",
        secondName: "Иванов",
        firstName: "Иван",
        surName: "Иванович",
        role: "user",
        tin: "1234567890",
        passport: {
            series: "4509",
            number: "123456",
            issuedBy: "ОВД Кировского района",
            dateOfIssue: "2015-06-15",
            departmentCode: "770-001",
        },
        snils: {
            number: "123-456-789 00",
            registrationDate: "2010-03-20",
        },
        createdAt: "2026-01-15",
        lastSeen: "2026-09-10",
    },
    {
        id: 2,
        login: "user2",
        password: "user2",
        email: "user2@bondbank.com",
        phoneNumber: "89234567890",
        secondName: "Петров",
        firstName: "Петр",
        surName: "Петрович",
        role: "user",
        tin: "2345678901",
        passport: {
            series: "4510",
            number: "234567",
            issuedBy: "ОВД Ленинского района",
            dateOfIssue: "2016-08-20",
            departmentCode: "770-002",
        },
        snils: {
            number: "234-567-890 11",
            registrationDate: "2011-05-25",
        },
        createdAt: "2026-02-20",
        lastSeen: "2026-06-15", 
    },
    {
        id: 3,
        login: "admin",
        password: "admin",
        email: "admin@bondbank.com",
        phoneNumber: "89345678901",
        secondName: "Сидоров",
        firstName: "Сидор",
        surName: "Сидорович",
        role: "admin",
        tin: "3456789012",
        passport: {
            series: "4511",
            number: "345678",
            issuedBy: "ОВД Центрального района",
            dateOfIssue: "2017-11-10",
            departmentCode: "770-003",
        },
        snils: {
            number: "345-678-901 22",
            registrationDate: "2012-07-30",
        },
        createdAt: "2025-12-01",
        lastSeen: "2026-09-15",
    },
];

/**
 * Моковые новости
 */
export const MOCK_NEWS: News[] = [
    {
        id: 1,
        title: "Московская биржа запустила новый тип облигаций",
        content: "Московская биржа объявила о запуске нового типа облигаций с плавающей ставкой...",
        author: "admin",
        date: "2026-09-10",
        category: "Биржи",
    },
    {
        id: 2,
        title: "Венская биржа показывает рост на 3%",
        content: "Индекс Венской биржи вырос на 3% за неделю благодаря позитивным новостям...",
        author: "admin",
        date: "2026-09-08",
        category: "Облигации",
    },
    {
        id: 3,
        title: "SIX Group анонсировала новые правила торговли",
        content: "Швейцарская биржа SIX Group анонсировала изменения в правилах торговли облигациями...",
        author: "admin",
        date: "2026-09-05",
        category: "Биржи",
    },
    {
        id: 4,
        title: "Прогноз рынка облигаций на 2027 год",
        content: "Аналитики BondBank подготовили прогноз развития рынка облигаций на 2027 год...",
        author: "admin",
        date: "2026-09-01",
        category: "Аналитика",
    },
];