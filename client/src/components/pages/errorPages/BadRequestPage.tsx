import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ErrorPages.module.css";

/**
 * Пропсы страницы 400
 */
interface BadRequestPageProps {
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
 * Страница 400 — Некорректный запрос
 * Отображается, когда пользователь передал неверные параметры
 */
const BadRequestPage = ({
    message,
    title,
    hint,
    returnPath,
    returnLabel,
}: BadRequestPageProps) => {
    const navigate = useNavigate();

    // Если message не передан — используем дефолтное
    const displayMessage = message || "Некорректный запрос";
    const displayTitle = title || "400 — Некорректный запрос";
    const displayHint = hint || "Проверьте введённые данные и попробуйте снова.";

    // Куда вернуться
    const finalReturnPath = returnPath || "/";
    const finalReturnLabel = returnLabel || "🏠 На главную";

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorCard}>
                <div className={styles.errorIcon}>⚠️</div>
                <h1 className={styles.errorTitle}>{displayTitle}</h1>
                <p className={styles.errorMessage}>{displayMessage}</p>
                <p className={styles.errorHint}>{displayHint}</p>
                <div className={styles.errorActions}>
                    <button
                        className={styles.errorButton}
                        onClick={() => navigate(finalReturnPath)}
                    >
                        {finalReturnLabel}
                    </button>
                    <button
                        className={styles.errorButtonSecondary}
                        onClick={() => navigate(-1)}
                    >
                        ← Назад
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BadRequestPage;