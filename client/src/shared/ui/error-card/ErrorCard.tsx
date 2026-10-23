import React from "react";
import styles from "./ErrorCard.module.css";

export interface ErrorCardProps {
    /** Основное сообщение об ошибке */
    message: string;
    /** Заголовок (по умолчанию — «Что-то пошло не так») */
    title?: string;
    /** Иконка-эмодзи (по умолчанию — ⚠️) */
    icon?: string;
    /** Текст на кнопке (по умолчанию — «Повторить») */
    retryLabel?: string;
    /** Колбэк на нажатие кнопки. Если не передан — кнопка не рендерится */
    onRetry?: () => void;
    /** Дополнительный CSS-класс */
    className?: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({
    message,
    title = "Что-то пошло не так",
    icon = "⚠️",
    retryLabel = "Повторить",
    onRetry,
    className,
}) => {
    return (
        <div className={`${styles.errorCard} ${className ?? ""}`}>
            <div className={styles.errorIcon}>{icon}</div>
            <h3 className={styles.errorTitle}>{title}</h3>
            <p className={styles.errorText}>{message}</p>
            {onRetry && (
                <button className={styles.retryButton} onClick={onRetry}>
                    🔄 {retryLabel}
                </button>
            )}
        </div>
    );
};

export default ErrorCard;