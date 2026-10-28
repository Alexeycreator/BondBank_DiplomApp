import React, { useRef, useState } from "react";
import styles from "./ImportExport.module.css";
import { useToast } from "../../../../shared/notifications/ToastContext";
import { importBondsFile } from "../../../../service/filesApi";
import { ApiRequestError } from "../../../../shared/api/client";

export interface ImportBondsProps {
    onImport: () => void | Promise<void>;
}

const ImportBonds: React.FC<ImportBondsProps> = ({ onImport }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [typeFile, setTypeFile] = useState("MoscowExchange");
    const { showToast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            await importBondsFile(file, typeFile);

            await onImport();
            showToast("Успешно", "Данные успешно импортированы", "success");
        } catch (err: unknown) {
            const msg = err instanceof ApiRequestError
                ? err.serverMessage || err.message
                : err instanceof Error ? err.message : "Не удалось импортировать файл";
            console.error("Ошибка импорта:", err);
            showToast("Ошибка", msg, "danger");
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className={styles.importBonds}>
            <label className={styles.exchangeSelectLabel} htmlFor="import-bonds-type">Биржа</label>
            <select
                id="import-bonds-type"
                className={styles.exchangeSelect}
                value={typeFile}
                onChange={(event) => setTypeFile(event.target.value)}
                disabled={isUploading}
            >
                <option value="MoscowExchange">Московская</option>
                <option value="LjubljanaStockExchange">Люблянская</option>
                <option value="WienerBoerse">Венская</option>
                <option value="SixGroup">Швейцарская</option>
            </select>
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className={styles.hiddenInput}
                id="import-bonds-input"
                disabled={isUploading}
            />
            <label htmlFor="import-bonds-input" className={styles.importButton}>
                {isUploading ? "Загрузка…" : "📥 Импорт CSV"}
            </label>
        </div>
    );
};

export default ImportBonds;