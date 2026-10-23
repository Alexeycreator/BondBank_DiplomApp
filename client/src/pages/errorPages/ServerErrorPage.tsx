import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ErrorPages.module.css";

/**
 * Пропсы страницы 500
 */
interface ServerErrorPageProps {
    /** Сообщение об ошибке */
    message?: string;
    /** Кастомный заголовок */
    title?: string;
    /** Подсказка для пользователя */
    hint?: string;
    /** Куда вернуться */
    returnPath?: string;
    /** Текст кнопки возврата */
    returnLabel?: string;
}

/**
 * Страница 500 — Внутренняя ошибка сервера
 */
const ServerErrorPage = ({
    message,
    title,
    hint,
    returnPath,
    returnLabel,
}: ServerErrorPageProps) => {
    const navigate = useNavigate();

    const displayMessage = message || "Что-то пошло не так на нашей стороне. Мы уже работаем над этим.";
    const displayTitle = title || "500 — Ошибка сервера";
    const displayHint = hint || "Попробуйте обновить страницу позже.";

    const finalReturnPath = returnPath || "/";
    const finalReturnLabel = returnLabel || "🏠 На главную";

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorCard}>
                <div className={styles.errorIcon}>💥</div>
                <h1 className={styles.errorTitle}>{displayTitle}</h1>
                <p className={styles.errorMessage}>{displayMessage}</p>
                <p className={styles.errorHint}>{displayHint}</p>
                <div className={styles.errorActions}>
                    <button
                        className={styles.errorButton}
                        onClick={() => window.location.reload()}
                    >
                        🔄 Обновить
                    </button>
                    <button
                        className={styles.errorButtonSecondary}
                        onClick={() => navigate(finalReturnPath)}
                    >
                        {finalReturnLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServerErrorPage;