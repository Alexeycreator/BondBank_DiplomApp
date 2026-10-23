import React from "react";
import styles from "./SearchFilters.module.css";

interface SearchFiltersProps {
    /** Выбранный тип облигации */
    searchType: string;
    /** Введенный ISIN */
    searchIsin: string;
    /** Колбэк при смене типа */
    onTypeChange: (value: string) => void;
    /** Колбэк при смене ISIN */
    onIsinChange: (value: string) => void;
    /** Колбэк при сбросе фильтров */
    onReset: () => void;
    /** Доступные типы для выпадающего списка (если нужно скрыть или отфильтровать) */
    availableTypes?: { value: string; label: string }[];
}

const DEFAULT_TYPES = [
    { value: "lse", label: "LSE (Любляна)" },
    { value: "wb", label: "WB (Вена)" },
    { value: "sg", label: "SG (Швейцария)" },
    { value: "me", label: "ME (Москва)" },
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
    searchType,
    searchIsin,
    onTypeChange,
    onIsinChange,
    onReset,
    availableTypes = DEFAULT_TYPES,
}) => {
    return (
        <section className={styles.searchSection}>
            <div className={styles.searchField}>
                <label htmlFor="searchType">Тип облигации:</label>
                <select
                    id="searchType"
                    value={searchType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className={styles.searchSelect}
                >
                    <option value="">Все типы</option>
                    {availableTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.searchField}>
                <label htmlFor="searchIsin">ISIN:</label>
                <input
                    id="searchIsin"
                    type="text"
                    value={searchIsin}
                    onChange={(e) => onIsinChange(e.target.value)}
                    placeholder="Введите ISIN..."
                    className={styles.searchInput}
                />
            </div>

            <button
                type="button"
                className={styles.resetButton}
                onClick={onReset}
            >
                Сбросить
            </button>
        </section>
    );
};