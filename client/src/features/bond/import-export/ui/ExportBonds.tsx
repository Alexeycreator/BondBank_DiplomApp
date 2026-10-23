import React from "react";
import styles from "./ImportExport.module.css";
import { BondView } from "../../../../entities/bond/model/bonds";
import { useToast } from "../../../../shared/notifications/ToastContext";

export interface ExportBondsProps {
    bonds: BondView[];
    filename: string;
}

const ExportBonds: React.FC<ExportBondsProps> = ({ bonds, filename }) => {
    const { showToast } = useToast();

    const handleExport = () => {
        if (bonds.length === 0) {
            showToast("Ошибка", "Нет данных для экспорта", "warning");
            return;
        }

        const headers = ["ID", "Название", "ISIN", "Тип", "Цена", "Валюта", "Доходность", "Дата погашения", "Обновлено"];
        const rows = bonds.map((bond) => [
            bond.id, bond.name, bond.isin, bond.type.toUpperCase(), bond.price,
            bond.currency, bond.yield !== null ? `${bond.yield}%` : "—",
            bond.maturity ?? "—", bond.updatedAt,
        ]);

        const escape = (value: unknown): string => {
            const str = String(value ?? "");
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csv = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // ✅ Показываем уведомление об успехе
        showToast("Успешно", `Файл ${filename}.csv скачан`, "success");
    };

    return (
        <button className={styles.exportButton} onClick={handleExport}>
            📤 Экспорт CSV
        </button>
    );
};

export default ExportBonds;