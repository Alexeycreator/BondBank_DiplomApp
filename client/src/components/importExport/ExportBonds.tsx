import React from "react";
import styles from "./ImportExport.module.css";
import { BondView } from "../data/types";

export interface ExportBondsProps {
    bonds: BondView[];
    filename: string;
}

const ExportBonds: React.FC<ExportBondsProps> = ({ bonds, filename }) => {
    const handleExport = () => {
        if (bonds.length === 0) {
            alert("Нет данных для экспорта");
            return;
        }

        // Формируем заголовки CSV
        const headers = [
            "ID",
            "Название",
            "ISIN",
            "Тип",
            "Цена",
            "Валюта",
            "Доходность",
            "Дата погашения",
            "Обновлено",
        ];

        // Формируем строки
        const rows = bonds.map((bond) => [
            bond.id,
            bond.name,
            bond.isin,
            bond.type.toUpperCase(),
            bond.price,
            bond.currency,
            bond.yield !== null ? `${bond.yield}%` : "—",
            bond.maturity ?? "—",
            bond.updatedAt,
        ]);

        // Собираем CSV
        const escape = (value: unknown): string => {
            const str = String(value ?? "");
            // Экранируем кавычки и оборачиваем, если есть запятые/кавычки/переносы
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csv = [
            headers.map(escape).join(","),
            ...rows.map((row) => row.map(escape).join(",")),
        ].join("\n");

        // Скачиваем файл
        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        }); // \uFEFF — BOM, чтобы Excel корректно открыл кириллицу

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button className={styles.exportButton} onClick={handleExport}>
            📤 Экспорт CSV
        </button>
    );
};

export default ExportBonds;