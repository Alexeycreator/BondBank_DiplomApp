import React, { useRef, useState } from "react";
import axios from "axios";
import styles from "./ImportExport.module.css";
import { useToast } from "../../../../shared/notifications/ToastContext";

export interface ImportBondsProps {
    onImport: () => void | Promise<void>;
}

const ImportBonds: React.FC<ImportBondsProps> = ({ onImport }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { showToast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            await axios.post(
                `${import.meta.env.VITE_API_URL_HTTPS}/Bonds/import-bonds`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            await onImport();
            showToast("Успешно", "Данные успешно импортированы", "success");
        } catch (err: unknown) {
            const responseMessage = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            const msg = responseMessage || (err instanceof Error ? err.message : "") || "Не удалось импортировать файл";
            console.error("Ошибка импорта:", err);
            showToast("Ошибка", msg, "danger");
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className={styles.importBonds}>
            <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} id="import-bonds-input" />
            <label htmlFor="import-bonds-input" className={styles.importButton}>
                {isUploading ? "Загрузка…" : "📥 Импорт CSV"}
            </label>
        </div>
    );
};

export default ImportBonds;