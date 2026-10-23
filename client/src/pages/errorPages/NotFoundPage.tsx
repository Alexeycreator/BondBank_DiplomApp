import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ErrorPages.module.css";

/**
 * Пропсы страницы 404
 */
interface NotFoundPageProps {
    /** ISIN облигации, если ошибка связана с её отсутствием */
    isin?: string;
    /** Кастомный заголовок */
    title?: string;
    /** Кастомное сообщение */
    message?: string;
    /** Куда вернуться (по умолчанию — на главную) */
    returnPath?: string;
    /** Текст кнопки возврата */
    returnLabel?: string;
}

/**
 * Страница 404 — Не найдено
 * Отображается, когда запрашиваемый ресурс не существует
 */
const NotFoundPage = ({
    isin,
    title,
    message,
    returnPath,
    returnLabel,
}: NotFoundPageProps) => {
    const navigate = useNavigate();

    // Если передан isin — формируем сообщение об облигации
    const displayTitle = title || (isin ? "404 — Облигация не найдена" : "404 — Страница не найдена");
    const displayMessage = message || (isin
        ? <>Облигация с ISIN <strong>"{isin}"</strong> не найдена в системе.</>
        : "К сожалению, запрашиваемая страница не существует или была удалена."
    );
    const displayHint = isin
        ? "Возможно, она была удалена или вы ввели неверный ISIN."
        : "Проверьте правильность введённого адреса или вернитесь на главную.";

    // Куда вернуться
    const finalReturnPath = returnPath || (isin ? "/bonds" : "/");
    const finalReturnLabel = returnLabel || (isin ? "Вернуться к списку облигаций" : "🏠 На главную");

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorCard}>
                <div className={styles.errorIcon}>🔍</div>
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

export default NotFoundPage;