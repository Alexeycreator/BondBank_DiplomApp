import React, { useState } from "react";
import { Bond } from "../types/index";
import { exportBondsToCsv } from "../../service/fileService";
import styles from "./ImportExport.module.css";

/**
 * Пропсы компонента экспорта
 */
interface ExportBondsProps {
    /** Облигации для экспорта */
    bonds: Bond[];
    /** Имя файла (без расширения) */
    filename?: string;
}

/**
 * Компонент экспорта облигаций в CSV-файл
 * Доступен всем авторизованным пользователям
 */
const ExportBonds = ({ bonds, filename = "bonds" }: ExportBondsProps) => {
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    /**
     * Обработчик экспорта
     */
    const handleExport = () => {
        if (bonds.length === 0) {
            setMessage({ type: "error", text: "Нет данных для экспорта" });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        try {
            exportBondsToCsv(bonds, filename);
            setMessage({
                type: "success",
                text: `✅ Экспортировано ${bonds.length} облигаций`,
            });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Ошибка экспорта" });
        }
    };

    return (
        <div className={styles.exportBlock}>
            <button className={styles.exportButton} onClick={handleExport}>
                📤 Экспорт облигаций ({bonds.length})
            </button>

            {message && (
                <div className={`${styles.message} ${message.type === "error" ? styles.errorMsg : styles.successMsg}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default ExportBonds;