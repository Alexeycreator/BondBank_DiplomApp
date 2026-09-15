import React, { useRef, useState } from "react";
import { Bond } from "../types/index";
import { importBondsFromCsv } from "../../service/fileService";
import styles from "./ImportExport.module.css";

/**
 * Пропсы компонента импорта
 */
interface ImportBondsProps {
    /** Callback при успешном импорте */
    onImport: (bonds: Bond[]) => void;
}

/**
 * Компонент импорта облигаций из CSV-файла
 * Доступен только администратору
 */
const ImportBonds = ({ onImport }: ImportBondsProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    /**
     * Обработчик выбора файла
     */
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Проверка расширения
        if (!file.name.toLowerCase().endsWith(".csv")) {
            setMessage({ type: "error", text: "Поддерживаются только CSV-файлы" });
            return;
        }

        setIsImporting(true);
        setMessage(null);

        try {
            const bonds = await importBondsFromCsv(file);

            if (bonds.length === 0) {
                setMessage({ type: "error", text: "Файл не содержит облигаций" });
                return;
            }

            onImport(bonds);
            setMessage({
                type: "success",
                text: `✅ Импортировано ${bonds.length} облигаций`,
            });

            // Сброс input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Ошибка импорта" });
        } finally {
            setIsImporting(false);
        }
    };

    /**
     * Открыть диалог выбора файла
     */
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.importBlock}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className={styles.hiddenInput}
            />
            <button
                className={styles.importButton}
                onClick={handleClick}
                disabled={isImporting}
            >
                {isImporting ? "⏳ Импорт..." : "📥 Импорт облигаций (CSV)"}
            </button>

            {message && (
                <div className={`${styles.message} ${message.type === "error" ? styles.errorMsg : styles.successMsg}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default ImportBonds;