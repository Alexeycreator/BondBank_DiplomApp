import React, { useEffect, useState, useRef } from "react";
import { OverlayTrigger, Tooltip, Form, Alert } from "react-bootstrap";
import styles from "./SearchFilters.module.css";

interface SearchFiltersProps {
    searchType: string;
    searchIsin: string;
    onSearch: (type: string, isin: string) => void;
    onReset: () => void;
    availableTypes?: { value: string; label: string }[];
    serverError?: string | null; // ✅ Ошибка от сервера
}

const DEFAULT_TYPES = [
    { value: "lse", label: "LSE (Любляна)" },
    { value: "wb", label: "WB (Вена)" },
    { value: "sg", label: "SG (Швейцария)" },
    { value: "me", label: "ME (Москва)" },
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
    searchType: initialType,
    searchIsin: initialIsin,
    onSearch,
    onReset,
    availableTypes = DEFAULT_TYPES,
    serverError
}) => {
    const [type, setType] = useState(initialType);
    const [isin, setIsin] = useState(initialIsin);
    const [isShaking, setIsShaking] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Эффект "дергания" при ошибке
    useEffect(() => {
        if (serverError) {
            setIsShaking(true);
            const timeout = setTimeout(() => setIsShaking(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [serverError]);

    // Debounce (3 секунды)
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            if (type !== initialType || isin !== initialIsin) {
                onSearch(type, isin);
            }
        }, 3000);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [type, isin, initialType, initialIsin, onSearch]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (timerRef.current) clearTimeout(timerRef.current);
            onSearch(type, isin);
        }
    };

    return (
        <section className={styles.searchSectionWrapper}>
            <section className={styles.searchSection}>
                <div className={`${styles.searchField} ${isShaking ? styles.shake : ""}`}>
                    <Form.Select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={`${styles.searchSelect} ${serverError ? styles.inputError : ""}`}
                        onKeyDown={handleKeyDown}
                    >
                        <option value="">Все биржи (Тип)</option>
                        {availableTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </Form.Select>
                </div>

                <div className={`${styles.searchField} ${isShaking ? styles.shake : ""}`}>
                    <Form.Control
                        type="text"
                        value={isin}
                        onChange={(e) => setIsin(e.target.value)}
                        placeholder="Введите ISIN..."
                        className={`${styles.searchInput} ${serverError ? styles.inputError : ""}`}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <OverlayTrigger
                    placement="top"
                    delay={{ show: 1500, hide: 0 }}
                    overlay={<Tooltip id="reset-tooltip">Сбросить фильтры</Tooltip>}
                >
                    <button
                        type="button"
                        className={styles.resetButton}
                        onClick={() => {
                            setType("");
                            setIsin("");
                            onReset();
                        }}
                    >
                        Сбросить
                    </button>
                </OverlayTrigger>
            </section>

            {/* ✅ Вывод ошибки сервера через Alert */}
            {serverError && (
                <Alert variant="danger" className="mt-2 mb-0 py-2">
                    {serverError}
                </Alert>
            )}
        </section>
    );
};