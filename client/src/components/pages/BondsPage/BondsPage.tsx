import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import styles from "./BondsPage.module.css";
import NotFoundPage from "../errorPages/NotFoundPage";
import BadRequestPage from "../errorPages/BadRequestPage";
import ImportBonds from "../../importExport/ImportBonds";
import ExportBonds from "../../importExport/ExportBonds";
import { useAuth } from "../../context/AuthContext";
import { Bond } from "../../types/index";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

/** Курсы валют (моковые) */
const CURRENCY_RATES: Record<string, number> = {
    RUB: 1,
    USD: 90.5,
    EUR: 98.3,
    CNY: 12.5,
};

/** Размер страницы пагинации */
const PAGE_SIZE = 50;

/**
 * Страница облигаций
 * Поддерживает чтение ISIN и номера страницы из URL
 */
const BondsPage = () => {
    // ==================== URL ПАРАМЕТРЫ ====================
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useAuth();

    // ✅ ISIN из URL
    const isinFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("isin");
    }, [location.search]);

    // ✅ Номер страницы из URL (1-based). По умолчанию 1.
    const pageFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get("page");
        const parsed = Number(raw);
        if (!raw || Number.isNaN(parsed) || parsed < 1) return 1;
        return Math.floor(parsed);
    }, [location.search]);

    // ==================== СОСТОЯНИЕ ОБЛИГАЦИЙ ====================
    const [bondsData, setBondsData] = useState<Bond[]>([
        // ===== ИСХОДНЫЕ 5 =====
        { id: 1, name: "SIJ 4. IZDAJA", isin: "SI0032103580", type: "lse", price: 9850, yield: 4.2, maturity: "2028-06-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 2, name: "SIJ 5. IZDAJA", isin: "SI0032103598", type: "lse", price: 9920, yield: 3.8, maturity: "2029-07-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 3, name: "SDH 3. IZDAJA", isin: "SI0002103529", type: "wb", price: 9780, yield: 5.1, maturity: "2027-11-01", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 4, name: "TELEKOM SLOVENIJE", isin: "SI0032103630", type: "sg", price: 10150, yield: 3.2, maturity: "2030-03-10", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 5, name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", type: "me", price: 9630, yield: 4.9, maturity: "2028-09-05", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },

        // ===== 200 НОВЫХ =====
        { id: 6, name: "NLB 1. IZDAJA", isin: "SI0022104501", type: "lse", price: 9990, yield: 3.5, maturity: "2028-02-10", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 7, name: "NLB 2. IZDAJA", isin: "SI0022104502", type: "lse", price: 10050, yield: 3.9, maturity: "2029-04-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 8, name: "KRKA 1. IZDAJA", isin: "SI0022104503", type: "lse", price: 10120, yield: 2.9, maturity: "2027-08-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 9, name: "KRKA 2. IZDAJA", isin: "SI0022104504", type: "lse", price: 9870, yield: 4.1, maturity: "2028-12-01", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 10, name: "PETROL 1. IZDAJA", isin: "SI0022104505", type: "lse", price: 9760, yield: 4.8, maturity: "2027-05-11", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 11, name: "PETROL 2. IZDAJA", isin: "SI0022104506", type: "lse", price: 9930, yield: 4.0, maturity: "2029-09-22", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 12, name: "MERCATOR 1. IZDAJA", isin: "SI0022104507", type: "wb", price: 9640, yield: 5.5, maturity: "2027-03-14", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 13, name: "MERCATOR 2. IZDAJA", isin: "SI0022104508", type: "wb", price: 9810, yield: 5.0, maturity: "2028-07-19", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 14, name: "GORENJE 1. IZDAJA", isin: "SI0022104509", type: "wb", price: 9700, yield: 5.3, maturity: "2027-10-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 15, name: "GORENJE 2. IZDAJA", isin: "SI0022104510", type: "wb", price: 9950, yield: 4.4, maturity: "2029-01-25", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 16, name: "LUKA KOPER 1. IZDAJA", isin: "SI0022104511", type: "lse", price: 10010, yield: 3.6, maturity: "2028-04-18", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 17, name: "LUKA KOPER 2. IZDAJA", isin: "SI0022104512", type: "lse", price: 9890, yield: 4.3, maturity: "2029-11-07", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 18, name: "TELEKOM SLOVENIJE 2", isin: "SI0022104513", type: "sg", price: 10080, yield: 3.1, maturity: "2027-06-09", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 19, name: "TELEKOM SLOVENIJE 3", isin: "SI0022104514", type: "sg", price: 10230, yield: 2.8, maturity: "2031-02-28", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 20, name: "ZAVAROVALNICA TRIGLAV 1", isin: "SI0022104515", type: "lse", price: 9970, yield: 3.7, maturity: "2028-08-13", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 21, name: "ZAVAROVALNICA TRIGLAV 2", isin: "SI0022104516", type: "lse", price: 10040, yield: 3.3, maturity: "2030-05-21", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 22, name: "SID BANKA 1. IZDAJA", isin: "SI0022104517", type: "wb", price: 9720, yield: 5.2, maturity: "2027-12-03", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 23, name: "SID BANKA 2. IZDAJA", isin: "SI0022104518", type: "wb", price: 9860, yield: 4.7, maturity: "2029-03-16", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 24, name: "BANKA CELJE 1", isin: "SI0022104519", type: "me", price: 9580, yield: 6.1, maturity: "2027-09-27", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 25, name: "BANKA CELJE 2", isin: "SI0022104520", type: "me", price: 9740, yield: 5.6, maturity: "2029-06-04", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 26, name: "RUSSIA 2028", isin: "RU000A0ZZZ01", type: "me", price: 9450, yield: 7.2, maturity: "2028-03-12", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 27, name: "RUSSIA 2030", isin: "RU000A0ZZZ02", type: "me", price: 9320, yield: 7.5, maturity: "2030-09-18", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 28, name: "GAZPROM 1", isin: "RU000A0ZZZ03", type: "me", price: 9210, yield: 8.1, maturity: "2027-07-05", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 29, name: "GAZPROM 2", isin: "RU000A0ZZZ04", type: "me", price: 9480, yield: 7.4, maturity: "2029-11-22", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 30, name: "ROSNEFT 1", isin: "RU000A0ZZZ05", type: "me", price: 9560, yield: 7.0, maturity: "2028-05-14", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 31, name: "ROSNEFT 2", isin: "RU000A0ZZZ06", type: "me", price: 9390, yield: 7.8, maturity: "2030-02-08", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 32, name: "LUKOIL 1", isin: "RU000A0ZZZ07", type: "me", price: 9670, yield: 6.8, maturity: "2027-10-19", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 33, name: "LUKOIL 2", isin: "RU000A0ZZZ08", type: "me", price: 9510, yield: 7.3, maturity: "2029-04-26", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 34, name: "SBERBANK 1", isin: "RU000A0ZZZ09", type: "me", price: 9280, yield: 8.4, maturity: "2027-01-30", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 35, name: "SBERBANK 2", isin: "RU000A0ZZZ10", type: "me", price: 9440, yield: 7.9, maturity: "2028-12-11", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 36, name: "VTB 1", isin: "RU000A0ZZZ11", type: "me", price: 9150, yield: 8.7, maturity: "2027-06-23", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 37, name: "VTB 2", isin: "RU000A0ZZZ12", type: "me", price: 9370, yield: 8.0, maturity: "2029-08-15", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 38, name: "GERMANY BUND 2028", isin: "DE0001102580", type: "wb", price: 10240, yield: 1.8, maturity: "2028-11-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 39, name: "GERMANY BUND 2030", isin: "DE0001102598", type: "wb", price: 10310, yield: 1.6, maturity: "2030-05-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 40, name: "FRANCE OAT 2028", isin: "FR0013280241", type: "wb", price: 10180, yield: 2.1, maturity: "2028-04-25", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 41, name: "FRANCE OAT 2032", isin: "FR0013280258", type: "wb", price: 10290, yield: 2.3, maturity: "2032-06-25", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 42, name: "AUSTRIA 2028", isin: "AT0000A1K9L5", type: "wb", price: 10150, yield: 2.0, maturity: "2028-09-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 43, name: "AUSTRIA 2032", isin: "AT0000A1K9M3", type: "wb", price: 10260, yield: 2.2, maturity: "2032-02-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 44, name: "ITALY BTP 2028", isin: "IT0005210650", type: "wb", price: 9960, yield: 3.4, maturity: "2028-03-01", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 45, name: "ITALY BTP 2030", isin: "IT0005210668", type: "wb", price: 10020, yield: 3.6, maturity: "2030-08-01", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 46, name: "SPAIN BONOS 2028", isin: "ES0000012B71", type: "wb", price: 10080, yield: 2.8, maturity: "2028-10-31", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 47, name: "SPAIN BONOS 2030", isin: "ES0000012B89", type: "wb", price: 10140, yield: 3.0, maturity: "2030-04-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 48, name: "SWITZERLAND 2028", isin: "CH0224397086", type: "sg", price: 10120, yield: 0.9, maturity: "2028-06-22", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 49, name: "SWITZERLAND 2032", isin: "CH0224397094", type: "sg", price: 10200, yield: 1.1, maturity: "2032-04-28", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 50, name: "NESTLE 2028", isin: "CH0224397102", type: "sg", price: 10090, yield: 1.4, maturity: "2028-08-15", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 51, name: "NESTLE 2032", isin: "CH0224397110", type: "sg", price: 10180, yield: 1.6, maturity: "2032-01-20", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 52, name: "NOVARTIS 2028", isin: "CH0224397128", type: "sg", price: 10060, yield: 1.5, maturity: "2028-11-10", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 53, name: "NOVARTIS 2030", isin: "CH0224397136", type: "sg", price: 10150, yield: 1.7, maturity: "2030-07-05", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 54, name: "ROCHE 2028", isin: "CH0224397144", type: "sg", price: 10070, yield: 1.4, maturity: "2028-05-18", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 55, name: "ROCHE 2030", isin: "CH0224397152", type: "sg", price: 10160, yield: 1.6, maturity: "2030-09-22", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 56, name: "UBS 2028", isin: "CH0224397160", type: "sg", price: 10030, yield: 2.1, maturity: "2028-02-14", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 57, name: "UBS 2030", isin: "CH0224397178", type: "sg", price: 10110, yield: 2.3, maturity: "2030-06-30", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 58, name: "APPLE 2028", isin: "US0378331005", type: "lse", price: 10180, yield: 3.2, maturity: "2028-05-11", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 59, name: "APPLE 2032", isin: "US0378331013", type: "lse", price: 10240, yield: 3.5, maturity: "2032-08-19", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 60, name: "MICROSOFT 2028", isin: "US5949181045", type: "lse", price: 10150, yield: 3.1, maturity: "2028-09-15", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 61, name: "MICROSOFT 2032", isin: "US5949181052", type: "lse", price: 10210, yield: 3.4, maturity: "2032-03-22", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 62, name: "AMAZON 2028", isin: "US0231351067", type: "lse", price: 10130, yield: 3.3, maturity: "2028-12-05", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 63, name: "AMAZON 2032", isin: "US0231351075", type: "lse", price: 10190, yield: 3.6, maturity: "2032-11-01", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 64, name: "GOOGLE 2028", isin: "US02079K1079", type: "lse", price: 10160, yield: 3.0, maturity: "2028-07-27", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 65, name: "GOOGLE 2032", isin: "US02079K1087", type: "lse", price: 10220, yield: 3.3, maturity: "2032-02-10", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 66, name: "TESLA 2028", isin: "US88160R1014", type: "lse", price: 10010, yield: 4.8, maturity: "2028-03-18", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 67, name: "TESLA 2030", isin: "US88160R1022", type: "lse", price: 10080, yield: 5.1, maturity: "2030-10-07", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 68, name: "JPMORGAN 2028", isin: "US46647PAA79", type: "lse", price: 10120, yield: 3.7, maturity: "2028-11-21", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 69, name: "JPMORGAN 2032", isin: "US46647PAB52", type: "lse", price: 10180, yield: 4.0, maturity: "2032-06-14", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 70, name: "GOLDMAN SACHS 2028", isin: "US38141GAA64", type: "lse", price: 10090, yield: 3.9, maturity: "2028-08-09", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 71, name: "GOLDMAN SACHS 2032", isin: "US38141GAB48", type: "lse", price: 10150, yield: 4.2, maturity: "2032-04-25", currency: "USD", currencyRate: 90.5, updatedAt: "2026-08-30" },
        { id: 72, name: "CHINA GOV 2028", isin: "CND10000ABC1", type: "me", price: 10040, yield: 2.6, maturity: "2028-06-30", currency: "CNY", currencyRate: 12.5, updatedAt: "2026-08-30" },
        { id: 73, name: "CHINA GOV 2032", isin: "CND10000ABC2", type: "me", price: 10110, yield: 2.8, maturity: "2032-09-15", currency: "CNY", currencyRate: 12.5, updatedAt: "2026-08-30" },
        { id: 74, name: "ICBC 2028", isin: "CND10000ABC3", type: "me", price: 9980, yield: 3.2, maturity: "2028-12-12", currency: "CNY", currencyRate: 12.5, updatedAt: "2026-08-30" },
        { id: 75, name: "ICBC 2032", isin: "CND10000ABC4", type: "me", price: 10050, yield: 3.4, maturity: "2032-03-08", currency: "CNY", currencyRate: 12.5, updatedAt: "2026-08-30" },
        { id: 76, name: "PETROCHINA 2028", isin: "CND10000ABC5", type: "me", price: 9940, yield: 3.5, maturity: "2028-05-20", currency: "CNY", currencyRate: 12.5, updatedAt: "2026-08-30" },
        { id: 77, name: "PETROCHINA 2032", isin: "CND10000ABC6", type: "me", price: 10020, yield: 3.7, maturity: "2032-11-11", currency: "CNY", currencyRate: 12.5, updatedAt: "2026-08-30" },
        { id: 78, name: "SIJ 6. IZDAJA", isin: "SI0032103600", type: "lse", price: 9880, yield: 4.0, maturity: "2030-01-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 79, name: "SIJ 7. IZDAJA", isin: "SI0032103618", type: "lse", price: 10030, yield: 3.4, maturity: "2031-03-22", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 80, name: "SDH 4. IZDAJA", isin: "SI0002103537", type: "wb", price: 9820, yield: 5.0, maturity: "2028-02-28", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 81, name: "SDH 5. IZDAJA", isin: "SI0002103545", type: "wb", price: 9960, yield: 4.6, maturity: "2030-07-14", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 82, name: "DARS 1. IZDAJA", isin: "SI0022104521", type: "lse", price: 10060, yield: 3.2, maturity: "2029-05-09", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 83, name: "DARS 2. IZDAJA", isin: "SI0022104522", type: "lse", price: 10190, yield: 2.7, maturity: "2033-08-17", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 84, name: "ELES 1. IZDAJA", isin: "SI0022104523", type: "lse", price: 9990, yield: 3.8, maturity: "2029-10-23", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 85, name: "ELES 2. IZDAJA", isin: "SI0022104524", type: "lse", price: 10110, yield: 3.1, maturity: "2032-12-06", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 86, name: "HSE 1. IZDAJA", isin: "SI0022104525", type: "wb", price: 9730, yield: 5.4, maturity: "2028-04-02", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 87, name: "HSE 2. IZDAJA", isin: "SI0022104526", type: "wb", price: 9880, yield: 4.9, maturity: "2030-11-19", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 88, name: "SŽ 1. IZDAJA", isin: "SI0022104527", type: "me", price: 9610, yield: 6.0, maturity: "2027-08-08", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 89, name: "SŽ 2. IZDAJA", isin: "SI0022104528", type: "me", price: 9770, yield: 5.5, maturity: "2029-12-15", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 90, name: "POŠTA SLOVENIJE 1", isin: "SI0022104529", type: "lse", price: 9950, yield: 3.9, maturity: "2028-06-27", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 91, name: "POŠTA SLOVENIJE 2", isin: "SI0022104530", type: "lse", price: 10070, yield: 3.5, maturity: "2031-01-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 92, name: "TRIGLAV 3. IZDAJA", isin: "SI0022104531", type: "wb", price: 9840, yield: 4.8, maturity: "2028-09-13", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 93, name: "TRIGLAV 4. IZDAJA", isin: "SI0022104532", type: "wb", price: 9990, yield: 4.3, maturity: "2030-03-25", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 94, name: "SAVA 1. IZDAJA", isin: "SI0022104533", type: "me", price: 9520, yield: 6.5, maturity: "2027-11-16", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 95, name: "SAVA 2. IZDAJA", isin: "SI0022104534", type: "me", price: 9680, yield: 6.0, maturity: "2029-07-29", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 96, name: "CINKARNA 1. IZDAJA", isin: "SI0022104535", type: "wb", price: 9710, yield: 5.3, maturity: "2028-01-19", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 97, name: "CINKARNA 2. IZDAJA", isin: "SI0022104536", type: "wb", price: 9860, yield: 4.8, maturity: "2030-05-06", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 98, name: "LAFARGE 1. IZDAJA", isin: "SI0022104537", type: "lse", price: 10020, yield: 3.6, maturity: "2029-02-11", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 99, name: "LAFARGE 2. IZDAJA", isin: "SI0022104538", type: "lse", price: 10140, yield: 3.0, maturity: "2032-07-24", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 100, name: "IMPOL 1. IZDAJA", isin: "SI0022104539", type: "wb", price: 9690, yield: 5.4, maturity: "2028-03-08", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 101, name: "IMPOL 2. IZDAJA", isin: "SI0022104540", type: "wb", price: 9840, yield: 4.9, maturity: "2030-09-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 102, name: "TALUM 1. IZDAJA", isin: "SI0022104541", type: "me", price: 9570, yield: 6.3, maturity: "2027-12-21", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 103, name: "TALUM 2. IZDAJA", isin: "SI0022104542", type: "me", price: 9730, yield: 5.8, maturity: "2029-10-14", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
        { id: 104, name: "HELIOS 1. IZDAJA", isin: "SI0022104543", type: "lse", price: 9980, yield: 3.9, maturity: "2028-08-02", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 105, name: "HELIOS 2. IZDAJA", isin: "SI0022104544", type: "lse", price: 10100, yield: 3.4, maturity: "2031-05-17", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 106, name: "KRKA 3. IZDAJA", isin: "SI0022104545", type: "wb", price: 9920, yield: 4.2, maturity: "2029-03-09", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 107, name: "KRKA 4. IZDAJA", isin: "SI0022104546", type: "wb", price: 10080, yield: 3.7, maturity: "2032-11-28", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 108, name: "LEK 1. IZDAJA", isin: "SI0022104547", type: "sg", price: 10130, yield: 2.9, maturity: "2029-06-15", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 109, name: "LEK 2. IZDAJA", isin: "SI0022104548", type: "sg", price: 10250, yield: 2.5, maturity: "2033-01-22", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 110, name: "NOVARTIS 2032", isin: "CH0224397186", type: "sg", price: 10230, yield: 1.8, maturity: "2032-10-12", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 111, name: "ROCHE 2032", isin: "CH0224397194", type: "sg", price: 10240, yield: 1.7, maturity: "2032-07-19", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 112, name: "ZURICH INSURANCE 2028", isin: "CH0224397202", type: "sg", price: 10050, yield: 2.0, maturity: "2028-04-04", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 113, name: "ZURICH INSURANCE 2032", isin: "CH0224397210", type: "sg", price: 10160, yield: 2.2, maturity: "2032-09-26", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 114, name: "SWISS RE 2028", isin: "CH0224397228", type: "sg", price: 10040, yield: 2.1, maturity: "2028-12-08", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 115, name: "SWISS RE 2032", isin: "CH0224397236", type: "sg", price: 10150, yield: 2.3, maturity: "2032-05-30", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 116, name: "SIEMENS 2028", isin: "DE000A2BPP01", type: "wb", price: 10100, yield: 2.5, maturity: "2028-07-11", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 117, name: "SIEMENS 2032", isin: "DE000A2BPP02", type: "wb", price: 10220, yield: 2.7, maturity: "2032-01-17", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 118, name: "BMW 2028", isin: "DE000A2BPP03", type: "wb", price: 10060, yield: 2.8, maturity: "2028-10-23", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 119, name: "BMW 2032", isin: "DE000A2BPP04", type: "wb", price: 10180, yield: 3.0, maturity: "2032-03-14", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 120, name: "VOLKSWAGEN 2028", isin: "DE000A2BPP05", type: "wb", price: 10020, yield: 3.1, maturity: "2028-06-05", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 121, name: "VOLKSWAGEN 2032", isin: "DE000A2BPP06", type: "wb", price: 10140, yield: 3.3, maturity: "2032-08-28", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 122, name: "BASF 2028", isin: "DE000A2BPP07", type: "wb", price: 10030, yield: 3.0, maturity: "2028-02-19", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 123, name: "BASF 2032", isin: "DE000A2BPP08", type: "wb", price: 10150, yield: 3.2, maturity: "2032-11-06", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 124, name: "BAYER 2028", isin: "DE000A2BPP09", type: "wb", price: 10010, yield: 3.2, maturity: "2028-09-02", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 125, name: "BAYER 2032", isin: "DE000A2BPP10", type: "wb", price: 10130, yield: 3.4, maturity: "2032-04-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 126, name: "ALLIANZ 2028", isin: "DE000A2BPP11", type: "wb", price: 10080, yield: 2.9, maturity: "2028-05-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 127, name: "ALLIANZ 2032", isin: "DE000A2BPP12", type: "wb", price: 10200, yield: 3.1, maturity: "2032-10-16", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 128, name: "DEUTSCHE BANK 2028", isin: "DE000A2BPP13", type: "wb", price: 9950, yield: 4.5, maturity: "2028-12-22", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 129, name: "DEUTSCHE BANK 2032", isin: "DE000A2BPP14", type: "wb", price: 10070, yield: 4.7, maturity: "2032-07-08", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 130, name: "COMMERZBANK 2028", isin: "DE000A2BPP15", type: "wb", price: 9970, yield: 4.3, maturity: "2028-08-14", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 131, name: "COMMERZBANK 2032", isin: "DE000A2BPP16", type: "wb", price: 10090, yield: 4.5, maturity: "2032-02-26", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 132, name: "BNP PARIBAS 2028", isin: "FR0013280266", type: "wb", price: 10050, yield: 3.8, maturity: "2028-11-29", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 133, name: "BNP PARIBAS 2032", isin: "FR0013280274", type: "wb", price: 10170, yield: 4.0, maturity: "2032-06-03", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 134, name: "SOCIETE GENERALE 2028", isin: "FR0013280282", type: "wb", price: 10000, yield: 4.1, maturity: "2028-03-27", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 135, name: "SOCIETE GENERALE 2032", isin: "FR0013280290", type: "wb", price: 10120, yield: 4.3, maturity: "2032-09-19", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 136, name: "TOTAL 2028", isin: "FR0013280308", type: "wb", price: 10110, yield: 2.9, maturity: "2028-07-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 137, name: "TOTAL 2032", isin: "FR0013280316", type: "wb", price: 10230, yield: 3.1, maturity: "2032-12-01", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 138, name: "LVMH 2028", isin: "FR0013280324", type: "wb", price: 10140, yield: 2.6, maturity: "2028-04-08", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 139, name: "LVMH 2032", isin: "FR0013280332", type: "wb", price: 10260, yield: 2.8, maturity: "2032-10-27", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 140, name: "SANOFI 2028", isin: "FR0013280340", type: "wb", price: 10120, yield: 2.7, maturity: "2028-01-31", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 141, name: "SANOFI 2032", isin: "FR0013280357", type: "wb", price: 10240, yield: 2.9, maturity: "2032-05-13", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 142, name: "AIRBUS 2028", isin: "FR0013280365", type: "wb", price: 10100, yield: 3.0, maturity: "2028-09-24", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 143, name: "AIRBUS 2032", isin: "FR0013280373", type: "wb", price: 10220, yield: 3.2, maturity: "2032-02-05", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 144, name: "ENI 2028", isin: "IT0005210676", type: "wb", price: 10040, yield: 3.3, maturity: "2028-06-18", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 145, name: "ENI 2032", isin: "IT0005210684", type: "wb", price: 10160, yield: 3.5, maturity: "2032-11-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 146, name: "ENEL 2028", isin: "IT0005210692", type: "wb", price: 10020, yield: 3.4, maturity: "2028-08-25", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 147, name: "ENEL 2032", isin: "IT0005210700", type: "wb", price: 10140, yield: 3.6, maturity: "2032-04-07", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 148, name: "INTESA SANPAOLO 2028", isin: "IT0005210718", type: "wb", price: 9990, yield: 4.2, maturity: "2028-12-14", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 149, name: "INTESA SANPAOLO 2032", isin: "IT0005210726", type: "wb", price: 10110, yield: 4.4, maturity: "2032-07-21", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 150, name: "UNICREDIT 2028", isin: "IT0005210734", type: "wb", price: 9980, yield: 4.4, maturity: "2028-05-03", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 151, name: "UNICREDIT 2032", isin: "IT0005210742", type: "wb", price: 10100, yield: 4.6, maturity: "2032-09-11", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 152, name: "SANTANDER 2028", isin: "ES0000012B97", type: "wb", price: 10010, yield: 4.0, maturity: "2028-10-19", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 153, name: "SANTANDER 2032", isin: "ES0000012C05", type: "wb", price: 10130, yield: 4.2, maturity: "2032-03-02", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 154, name: "BBVA 2028", isin: "ES0000012C13", type: "wb", price: 10000, yield: 4.1, maturity: "2028-07-28", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 155, name: "BBVA 2032", isin: "ES0000012C21", type: "wb", price: 10120, yield: 4.3, maturity: "2032-12-23", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 156, name: "IBERDROLA 2028", isin: "ES0000012C39", type: "wb", price: 10070, yield: 3.1, maturity: "2028-02-06", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 157, name: "IBERDROLA 2032", isin: "ES0000012C47", type: "wb", price: 10190, yield: 3.3, maturity: "2032-08-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 158, name: "TELEFONICA 2028", isin: "ES0000012C54", type: "wb", price: 10030, yield: 3.5, maturity: "2028-11-12", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 159, name: "TELEFONICA 2032", isin: "ES0000012C62", type: "wb", price: 10150, yield: 3.7, maturity: "2032-05-25", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 160, name: "REPSOL 2028", isin: "ES0000012C70", type: "wb", price: 10000, yield: 3.8, maturity: "2028-04-13", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 161, name: "REPSOL 2032", isin: "ES0000012C88", type: "wb", price: 10120, yield: 4.0, maturity: "2032-10-04", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 162, name: "SIEMENS ENERGY 2028", isin: "DE000A2BPP17", type: "wb", price: 10040, yield: 3.2, maturity: "2028-06-29", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 163, name: "SIEMENS ENERGY 2032", isin: "DE000A2BPP18", type: "wb", price: 10160, yield: 3.4, maturity: "2032-01-09", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 164, name: "MUNICH RE 2028", isin: "DE000A2BPP19", type: "wb", price: 10100, yield: 2.4, maturity: "2028-08-21", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 165, name: "MUNICH RE 2032", isin: "DE000A2BPP20", type: "wb", price: 10220, yield: 2.6, maturity: "2032-03-31", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 166, name: "HENKEL 2028", isin: "DE000A2BPP21", type: "wb", price: 10090, yield: 2.5, maturity: "2028-12-01", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 167, name: "HENKEL 2032", isin: "DE000A2BPP22", type: "wb", price: 10210, yield: 2.7, maturity: "2032-07-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 168, name: "ADIDAS 2028", isin: "DE000A2BPP23", type: "wb", price: 10050, yield: 2.8, maturity: "2028-09-08", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 169, name: "ADIDAS 2032", isin: "DE000A2BPP24", type: "wb", price: 10170, yield: 3.0, maturity: "2032-02-18", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 170, name: "SAP 2028", isin: "DE000A2BPP25", type: "wb", price: 10130, yield: 2.3, maturity: "2028-05-04", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 171, name: "SAP 2032", isin: "DE000A2BPP26", type: "wb", price: 10250, yield: 2.5, maturity: "2032-11-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 172, name: "INFINEON 2028", isin: "DE000A2BPP27", type: "wb", price: 10020, yield: 3.6, maturity: "2028-10-11", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 173, name: "INFINEON 2032", isin: "DE000A2BPP28", type: "wb", price: 10140, yield: 3.8, maturity: "2032-06-27", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 174, name: "NOKIA 2028", isin: "FI4000435101", type: "wb", price: 10000, yield: 3.7, maturity: "2028-03-23", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 175, name: "NOKIA 2032", isin: "FI4000435119", type: "wb", price: 10120, yield: 3.9, maturity: "2032-09-05", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 176, name: "FORTUM 2028", isin: "FI4000435127", type: "wb", price: 10060, yield: 2.9, maturity: "2028-07-30", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 177, name: "FORTUM 2032", isin: "FI4000435135", type: "wb", price: 10180, yield: 3.1, maturity: "2032-01-12", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 178, name: "NORDEA 2028", isin: "FI4000435143", type: "wb", price: 10030, yield: 3.2, maturity: "2028-11-06", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 179, name: "NORDEA 2032", isin: "FI4000435150", type: "wb", price: 10150, yield: 3.4, maturity: "2032-04-28", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 180, name: "EQUINOR 2028", isin: "NO0010876501", type: "wb", price: 10110, yield: 2.8, maturity: "2028-06-08", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 181, name: "EQUINOR 2032", isin: "NO0010876519", type: "wb", price: 10230, yield: 3.0, maturity: "2032-12-14", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 182, name: "DNB 2028", isin: "NO0010876527", type: "wb", price: 10050, yield: 3.3, maturity: "2028-09-26", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 183, name: "DNB 2032", isin: "NO0010876535", type: "wb", price: 10170, yield: 3.5, maturity: "2032-02-02", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 184, name: "VESTAS 2028", isin: "DK0030368101", type: "wb", price: 10010, yield: 3.9, maturity: "2028-04-17", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 185, name: "VESTAS 2032", isin: "DK0030368119", type: "wb", price: 10130, yield: 4.1, maturity: "2032-10-09", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 186, name: "NOVO NORDISK 2028", isin: "DK0030368127", type: "wb", price: 10120, yield: 2.2, maturity: "2028-08-03", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 187, name: "NOVO NORDISK 2032", isin: "DK0030368135", type: "wb", price: 10240, yield: 2.4, maturity: "2032-03-18", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 188, name: "MAERSK 2028", isin: "DK0030368143", type: "wb", price: 10030, yield: 3.4, maturity: "2028-11-21", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 189, name: "MAERSK 2032", isin: "DK0030368150", type: "wb", price: 10150, yield: 3.6, maturity: "2032-07-06", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 190, name: "SHELL 2028", isin: "GB00B03MLX29", type: "wb", price: 10100, yield: 2.7, maturity: "2028-05-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 191, name: "SHELL 2032", isin: "GB00B03MLX37", type: "wb", price: 10220, yield: 2.9, maturity: "2032-11-27", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 192, name: "BP 2028", isin: "GB00B03MLX45", type: "wb", price: 10070, yield: 3.0, maturity: "2028-09-19", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 193, name: "BP 2032", isin: "GB00B03MLX52", type: "wb", price: 10190, yield: 3.2, maturity: "2032-04-11", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 194, name: "HSBC 2028", isin: "GB00B03MLX60", type: "wb", price: 10020, yield: 3.8, maturity: "2028-12-29", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 195, name: "HSBC 2032", isin: "GB00B03MLX78", type: "wb", price: 10140, yield: 4.0, maturity: "2032-08-08", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 196, name: "BARCLAYS 2028", isin: "GB00B03MLX86", type: "wb", price: 9990, yield: 4.3, maturity: "2028-06-22", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 197, name: "BARCLAYS 2032", isin: "GB00B03MLX94", type: "wb", price: 10110, yield: 4.5, maturity: "2032-01-04", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 198, name: "ASTRAZENECA 2028", isin: "GB00B03MLY02", type: "wb", price: 10130, yield: 2.6, maturity: "2028-10-16", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 199, name: "ASTRAZENECA 2032", isin: "GB00B03MLY10", type: "wb", price: 10250, yield: 2.8, maturity: "2032-06-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 200, name: "GLAXOSMITHKLINE 2028", isin: "GB00B03MLY28", type: "wb", price: 10110, yield: 2.7, maturity: "2028-02-25", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 201, name: "GLAXOSMITHKLINE 2032", isin: "GB00B03MLY36", type: "wb", price: 10230, yield: 2.9, maturity: "2032-09-02", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 202, name: "UNILEVER 2028", isin: "GB00B03MLY44", type: "wb", price: 10090, yield: 2.5, maturity: "2028-07-07", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 203, name: "UNILEVER 2032", isin: "GB00B03MLY51", type: "wb", price: 10210, yield: 2.7, maturity: "2032-12-18", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 204, name: "DIAGEO 2028", isin: "GB00B03MLY69", type: "wb", price: 10100, yield: 2.6, maturity: "2028-05-27", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 205, name: "DIAGEO 2032", isin: "GB00B03MLY77", type: "wb", price: 10220, yield: 2.8, maturity: "2032-03-09", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
    ]);

    // ==================== ОСТАЛЬНОЕ СОСТОЯНИЕ ====================
    const [searchType, setSearchType] = useState<string>("");
    const [searchIsin, setSearchIsin] = useState<string>("");
    const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string>("RUB");
    const [notFound, setNotFound] = useState<boolean>(false);
    const [badRequest, setBadRequest] = useState<string | null>(null);

    // ✅ Текущая страница (синхронизируется с URL)
    const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);

    // ==================== АВТОВЫБОР ОБЛИГАЦИИ ИЗ URL ====================
    useEffect(() => {
        setNotFound(false);
        setBadRequest(null);
        setSelectedBond(null);

        if (!isinFromUrl) return;

        if (isinFromUrl.trim() === "") {
            setBadRequest("ISIN не может быть пустым или состоять из пробелов");
            return;
        }

        if (isinFromUrl.length !== 12) {
            setBadRequest(`ISIN должен содержать 12 символов, получено: ${isinFromUrl.length}`);
            return;
        }

        const foundBond = bondsData.find(
            (b) => b.isin.toLowerCase() === isinFromUrl.toLowerCase()
        );

        if (foundBond) {
            setSelectedBond(foundBond);
        } else {
            setNotFound(true);
        }
    }, [isinFromUrl, bondsData]);

    // ==================== СИНХРОНИЗАЦИЯ URL → STATE ====================
    useEffect(() => {
        setCurrentPage(pageFromUrl);
    }, [pageFromUrl]);

    // ==================== ФИЛЬТРАЦИЯ ====================
    const filteredBonds = useMemo(() => {
        return bondsData.filter((bond) => {
            const matchType = searchType === "" || bond.type === searchType;
            const matchIsin = searchIsin === "" || bond.isin.toLowerCase().includes(searchIsin.toLowerCase());
            return matchType && matchIsin;
        });
    }, [bondsData, searchType, searchIsin]);

    // ==================== ПАГИНАЦИЯ ====================
    const totalPages = Math.max(1, Math.ceil(filteredBonds.length / PAGE_SIZE));

    // ✅ Если URL содержит page больше totalPages — показываем последнюю
    const safePage = Math.min(currentPage, totalPages);

    const paginatedBonds = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredBonds.slice(start, start + PAGE_SIZE);
    }, [filteredBonds, safePage]);

    // ✅ Сброс страницы при изменении фильтров
    useEffect(() => {
        setCurrentPage(1);
        const params = new URLSearchParams(location.search);
        if (params.has("page")) {
            params.delete("page");
            navigate(`/bonds?${params.toString()}`, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchType, searchIsin]);

    // ✅ Переход на страницу с обновлением URL
    const handlePageChange = (page: number) => {
        const clamped = Math.min(Math.max(1, page), totalPages);
        if (clamped === safePage) return;

        const params = new URLSearchParams(location.search);
        if (clamped === 1) {
            params.delete("page"); // 1-я страница — без параметра
        } else {
            params.set("page", String(clamped));
        }
        navigate(`/bonds?${params.toString()}`, { replace: true });
        setCurrentPage(clamped);
    };

    // ✅ Формируем список номеров страниц для отображения (окно вокруг текущей)
    const pageNumbers = useMemo(() => {
        const delta = 2; // по 2 соседних страницы
        const start = Math.max(1, safePage - delta);
        const end = Math.min(totalPages, safePage + delta);
        const nums: number[] = [];
        for (let i = start; i <= end; i++) nums.push(i);
        return nums;
    }, [safePage, totalPages]);

    // ==================== КОНВЕРТАЦИЯ ВАЛЮТ ====================
    const convertPrice = (priceInRub: number, targetCurrency: string): number => {
        const rate = CURRENCY_RATES[targetCurrency] || 1;
        return priceInRub / rate;
    };

    const formatPrice = (priceInRub: number, currency: string): string => {
        const converted = convertPrice(priceInRub, currency);
        return `${converted.toFixed(2)} ${currency}`;
    };

    // ==================== ИМПОРТ ОБЛИГАЦИЙ (АДМИН) ====================
    const handleImport = (newBonds: Bond[]) => {
        setBondsData((prev) => {
            const existingIsins = new Set(prev.map((b) => b.isin.toLowerCase()));
            const uniqueNew = newBonds.filter(
                (b) => b.isin && !existingIsins.has(b.isin.toLowerCase())
            );

            if (uniqueNew.length === 0) {
                alert("Все облигации из файла уже существуют в системе");
                return prev;
            }

            const maxId = prev.reduce((max, b) => Math.max(max, b.id), 0);
            const withIds = uniqueNew.map((b, i) => ({ ...b, id: maxId + i + 1 }));

            return [...withIds, ...prev];
        });
    };

    // ==================== ДАННЫЕ ДЛЯ ГРАФИКА ====================
    const chartData = useMemo(() => ({
        labels: ["Авг 01", "Авг 03", "Авг 05", "Авг 07", "Авг 09", "Авг 11", "Авг 13"],
        datasets: [
            {
                label: `Цена облигации (${selectedCurrency})`,
                data: [97.2, 98.1, 97.8, 98.5, 99.0, 98.7, 99.3].map((p) =>
                    convertPrice(p * 100, selectedCurrency)
                ),
                borderColor: "#4fc3f7",
                backgroundColor: "rgba(79, 195, 247, 0.1)",
                fill: true,
                tension: 0.3,
                pointBackgroundColor: "#4fc3f7",
            },
        ],
    }), [selectedCurrency]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: { display: true, position: "top" as const },
            title: {
                display: true,
                text: selectedBond
                    ? `Динамика цены: ${selectedBond.name}`
                    : "Выберите облигацию для просмотра графика",
                font: { size: 16 },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function (value: string | number) {
                        return `${value} ${selectedCurrency}`;
                    },
                },
            },
        },
    }), [selectedBond, selectedCurrency]);

    // ==================== ОБРАБОТЧИКИ ====================
    const handleBondClick = (bond: Bond) => {
        setSelectedBond(bond);
        setNotFound(false);
        setBadRequest(null);
        // сохраняем текущую страницу при выборе облигации
        const params = new URLSearchParams(location.search);
        params.set("isin", bond.isin);
        if (safePage > 1) params.set("page", String(safePage));
        navigate(`/bonds?${params.toString()}`, { replace: true });
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCurrency(e.target.value);
    };

    // ==================== СТРАНИЦА BAD REQUEST ====================
    if (badRequest) {
        return (
            <BadRequestPage
                message={badRequest}
                hint="Проверьте правильность введённого ISIN. Он должен содержать ровно 12 символов."
                returnPath="/bonds"
                returnLabel="Вернуться к списку облигаций"
            />
        );
    }

    // ==================== СТРАНИЦА NOT FOUND ====================
    if (notFound) {
        return (
            <NotFoundPage
                isin={isinFromUrl || ""}
                returnPath="/bonds"
                returnLabel="Вернуться к списку облигаций"
            />
        );
    }

    // ==================== ОСНОВНОЙ РЕНДЕР ====================
    return (
        <div className={styles.bondsPage}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>📈 Облигации</h1>
                    <p className={styles.pageDescription}>
                        Список доступных облигаций и график динамики цены
                    </p>
                </div>

                <div className={styles.headerActions}>
                    {isAdmin && (
                        <ImportBonds onImport={handleImport} />
                    )}

                    {isAuthenticated && (
                        <ExportBonds bonds={filteredBonds} filename="bonds" />
                    )}

                    <div className={styles.currencySelector}>
                        <label htmlFor="currency">Валюта:</label>
                        <select
                            id="currency"
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            className={styles.currencySelect}
                        >
                            {Object.keys(CURRENCY_RATES).map((curr) => (
                                <option key={curr} value={curr}>{curr}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ==================== ПОИСК ==================== */}
            <section className={styles.searchSection}>
                <div className={styles.searchField}>
                    <label htmlFor="searchType">Тип облигации:</label>
                    <select
                        id="searchType"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className={styles.searchSelect}
                    >
                        <option value="">Все типы</option>
                        <option value="lse">LSE (Любляна)</option>
                        <option value="wb">WB (Вена)</option>
                        <option value="sg">SG (Швейцария)</option>
                        <option value="me">ME (Москва)</option>
                    </select>
                </div>

                <div className={styles.searchField}>
                    <label htmlFor="searchIsin">ISIN:</label>
                    <input
                        id="searchIsin"
                        type="text"
                        value={searchIsin}
                        onChange={(e) => setSearchIsin(e.target.value)}
                        placeholder="Введите ISIN..."
                        className={styles.searchInput}
                    />
                </div>

                <button
                    className={styles.resetButton}
                    onClick={() => {
                        setSearchType("");
                        setSearchIsin("");
                    }}
                >
                    Сбросить
                </button>
            </section>

            {/* ==================== ГРАФИК + ИНФОРМАЦИЯ ==================== */}
            <section className={styles.chartAndInfoSection}>
                <div className={styles.chartSection}>
                    <div className={styles.chartContainer}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className={styles.infoSection}>
                    {selectedBond ? (
                        <>
                            <h2 className={styles.infoTitle}>{selectedBond.name}</h2>
                            <div className={styles.infoList}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>ISIN:</span>
                                    <span className={styles.infoValue}>{selectedBond.isin}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Тип:</span>
                                    <span className={styles.infoValue}>{selectedBond.type.toUpperCase()}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Цена:</span>
                                    <span className={styles.infoValueHighlight}>
                                        {formatPrice(selectedBond.price, selectedCurrency)}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Доходность:</span>
                                    <span className={styles.infoValue}>{selectedBond.yield}%</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Дата погашения:</span>
                                    <span className={styles.infoValue}>{selectedBond.maturity}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Валюта:</span>
                                    <span className={styles.infoValue}>{selectedBond.currency}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Курс валюты:</span>
                                    <span className={styles.infoValue}>{selectedBond.currencyRate}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Обновлено:</span>
                                    <span className={styles.infoValue}>{selectedBond.updatedAt}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.noSelection}>
                            <p>👈 Выберите облигацию из списка, чтобы увидеть подробную информацию</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ==================== ТАБЛИЦА ==================== */}
            <section className={styles.tableSection}>
                <h2 className={styles.sectionTitle}>
                    Список облигаций ({filteredBonds.length})
                </h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>ISIN</th>
                                <th>Тип</th>
                                <th>Цена</th>
                                <th>Доходность</th>
                                <th>Дата погашения</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBonds.length > 0 ? (
                                paginatedBonds.map((bond) => (
                                    <tr
                                        key={bond.id}
                                        onClick={() => handleBondClick(bond)}
                                        className={selectedBond?.id === bond.id ? styles.selectedRow : ""}
                                    >
                                        <td>{bond.id}</td>
                                        <td>{bond.name}</td>
                                        <td className={styles.isin}>{bond.isin}</td>
                                        <td>
                                            <span className={styles.typeBadge}>
                                                {bond.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{formatPrice(bond.price, selectedCurrency)}</td>
                                        <td className={bond.yield > 4.5 ? styles.yieldHigh : styles.yieldLow}>
                                            {bond.yield}%
                                        </td>
                                        <td>{bond.maturity}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className={styles.noData}>
                                        Облигации не найдены
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ==================== ПАГИНАЦИЯ ==================== */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageButton}
                            onClick={() => handlePageChange(safePage - 1)}
                            disabled={safePage === 1}
                            aria-label="Предыдущая страница"
                        >
                            ←
                        </button>

                        {pageNumbers[0] > 1 && (
                            <>
                                <button
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(1)}
                                >
                                    1
                                </button>
                                {pageNumbers[0] > 2 && (
                                    <span className={styles.pageEllipsis}>…</span>
                                )}
                            </>
                        )}

                        {pageNumbers.map((num) => (
                            <button
                                key={num}
                                className={`${styles.pageButton} ${num === safePage ? styles.pageButtonActive : ""
                                    }`}
                                onClick={() => handlePageChange(num)}
                            >
                                {num}
                            </button>
                        ))}

                        {pageNumbers[pageNumbers.length - 1] < totalPages && (
                            <>
                                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                                    <span className={styles.pageEllipsis}>…</span>
                                )}
                                <button
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(totalPages)}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

                        <button
                            className={styles.pageButton}
                            onClick={() => handlePageChange(safePage + 1)}
                            disabled={safePage === totalPages}
                            aria-label="Следующая страница"
                        >
                            →
                        </button>

                        <span className={styles.pageInfo}>
                            Стр. {safePage} из {totalPages}
                        </span>
                    </div>
                )}
            </section>
        </div>
    );
};

export default BondsPage;