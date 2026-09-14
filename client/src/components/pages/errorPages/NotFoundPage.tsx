import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ErrorPages.module.css";

/**
 * Страница 404 — Не найдено
 * Отображается, когда запрашиваемый ресурс не существует
 */
const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorCard}>
                <div className={styles.errorIcon}>🔍</div>
                <h1 className={styles.errorTitle}>404 — Страница не найдена</h1>
                <p className={styles.errorMessage}>
                    К сожалению, запрашиваемая страница не существует или была удалена.
                </p>
                <p className={styles.errorHint}>
                    Проверьте правильность введённого адреса или вернитесь на главную.
                </p>
                <div className={styles.errorActions}>
                    <button
                        className={styles.errorButton}
                        onClick={() => navigate("/")}
                    >
                        🏠 На главную
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