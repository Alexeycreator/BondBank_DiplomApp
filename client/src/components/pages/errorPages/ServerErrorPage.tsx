import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ErrorPages.module.css";

/**
 * Страница 500 — Внутренняя ошибка сервера
 */
const ServerErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorCard}>
                <div className={styles.errorIcon}>💥</div>
                <h1 className={styles.errorTitle}>500 — Ошибка сервера</h1>
                <p className={styles.errorMessage}>
                    Что-то пошло не так на нашей стороне. Мы уже работаем над этим.
                </p>
                <p className={styles.errorHint}>
                    Попробуйте обновить страницу позже.
                </p>
                <div className={styles.errorActions}>
                    <button
                        className={styles.errorButton}
                        onClick={() => window.location.reload()}
                    >
                        🔄 Обновить
                    </button>
                    <button
                        className={styles.errorButtonSecondary}
                        onClick={() => navigate("/")}
                    >
                        🏠 На главную
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServerErrorPage;