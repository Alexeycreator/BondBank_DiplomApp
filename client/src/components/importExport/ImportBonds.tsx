import React, { useRef, useState } from "react";
import axios from "axios";
import styles from "./ImportExport.module.css";

export interface ImportBondsProps {
    /** Колбэк, вызывается после успешной загрузки файла на сервер */
    onImport: () => void | Promise<void>;
    /** Опциональный колбэк при ошибке */
    onError?: (message: string) => void;
}

const ImportBonds: React.FC<ImportBondsProps> = ({ onImport, onError }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append("file", file);

            await axios.post(
                `${process.env.REACT_APP_API_URL_HTTPS}/Bonds/import-bonds`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            await onImport();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Не удалось импортировать файл";
            console.error("Ошибка импорта:", err);
            onError?.(msg);
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className={styles.importBonds}>
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="import-bonds-input"
            />
            <label htmlFor="import-bonds-input" className={styles.importButton}>
                {isUploading ? "Загрузка…" : "📥 Импорт CSV"}
            </label>
        </div>
    );
};

export default ImportBonds;