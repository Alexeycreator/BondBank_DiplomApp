import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./ErrorPages.module.css";

/**
 * Страница 400 — Некорректный запрос
 * Отображается, когда пользователь передал неверные параметры
 */
const BadRequestPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const message = searchParams.get("message") || "Некорректный запрос";

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorCard}>
                <div className={styles.errorIcon}>⚠️</div>
                <h1 className={styles.errorTitle}>400 — Некорректный запрос</h1>
                <p className={styles.errorMessage}>{message}</p>
                <p className={styles.errorHint}>
                    Проверьте введённые данные и попробуйте снова.
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

export default BadRequestPage;