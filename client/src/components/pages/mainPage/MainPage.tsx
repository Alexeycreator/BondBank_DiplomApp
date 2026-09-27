import React, { useEffect, useState } from "react";
import styles from "./MainPage.module.css";
import { getInfoStatisticsBlockData } from "../../data/mainPageApi";
import ErrorCard from "../../errorCard/ErrorCard";
import { InfoStatisticsBlock } from "../../data/types";

const MainPage = () => {
    const [infoStatisticsBlockData, setInfoStatisticsBlockData] =
        useState<InfoStatisticsBlock | null>(null);
    const [loadingInfoStatisticsBlockData, setLoadingInfoStatisticsBlockData] =
        useState(true);
    const [error, setError] = useState<{ message: string; isNetwork: boolean } | null>(null);

    const fetchInfoStatisticsBlockData = async () => {
        try {
            setLoadingInfoStatisticsBlockData(true);
            setError(null);
            const data = await getInfoStatisticsBlockData();
            setInfoStatisticsBlockData(data);
        } catch (err: any) {
            console.error("Ошибка загрузки статистики:", err);
            const isNetwork = Boolean(err?.isNetworkError);
            const message =
                err?.serverMessage ||
                err?.message ||
                "Не удалось загрузить статистику. Попробуйте позже.";
            setError({ message, isNetwork });
        } finally {
            setLoadingInfoStatisticsBlockData(false);
        }
    };

    useEffect(() => {
        fetchInfoStatisticsBlockData();
    }, []);

    const stats = infoStatisticsBlockData
        ? [
            {
                label: "Всего облигаций",
                value: infoStatisticsBlockData.totalBonds?.toLocaleString("ru-RU") ?? "—",
            },
            {
                label: "Активных пользователей",
                value: infoStatisticsBlockData.activeUsers?.toLocaleString("ru-RU") ?? "—",
            },
            {
                label: "Бирж",
                value: infoStatisticsBlockData.exchanges?.toLocaleString("ru-RU") ?? "—",
            },
        ]
        : [];

    return (
        <div className={styles.mainPage}>
            {/* Приветственный баннер */}
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    Добро пожаловать в <span className={styles.highlight}>BondBank</span>
                </h1>
                <p className={styles.heroSubtitle}>
                    Платформа для мониторинга, анализа и прогнозирования облигаций
                </p>
                <button className={styles.heroButton}>Начать работу</button>
            </section>

            {/* Блок со статистикой */}
            <section className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>Ключевые показатели</h2>

                {loadingInfoStatisticsBlockData ? (
                    <div className={styles.statsGrid}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`${styles.statCard} ${styles.skeleton}`}>
                                <p className={styles.statValue}>…</p>
                                <p className={styles.statLabel}>Загрузка…</p>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <ErrorCard
                        icon={error.isNetwork ? "🛰️" : "⚠️"}
                        title={error.isNetwork ? "Сервер недоступен" : "Не удалось загрузить данные"}
                        message={
                            error.isNetwork
                                ? "Не удаётся связаться с сервером. Проверьте, запущен ли бэкенд, и повторите попытку."
                                : error.message
                        }
                        retryLabel="Повторить"
                        onRetry={fetchInfoStatisticsBlockData}
                    />
                ) : (
                    <div className={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <div key={index} className={styles.statCard}>
                                <p className={styles.statValue}>{stat.value}</p>
                                <p className={styles.statLabel}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Информационные карточки */}
            <section className={styles.infoSection}>
                <h2 className={styles.sectionTitle}>О платформе</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>📈</div>
                        <h3 className={styles.infoTitle}>Анализ в реальном времени</h3>
                        <p className={styles.infoText}>
                            Отслеживайте изменения цен облигаций в режиме реального времени
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>🔮</div>
                        <h3 className={styles.infoTitle}>Прогноз цен на 2 дня</h3>
                        <p className={styles.infoText}>
                            Система прогнозирует цену облигации на следующие два дня
                            с указанием уровня уверенности на основе ML-модели
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>📥</div>
                        <h3 className={styles.infoTitle}>Импорт файлов</h3>
                        <p className={styles.infoText}>
                            Загружайте облигации из CSV-файлов с автоматической
                            проверкой дубликатов и валидацией данных
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>📤</div>
                        <h3 className={styles.infoTitle}>Экспорт файлов</h3>
                        <p className={styles.infoText}>
                            Выгружайте данные об облигациях в CSV для работы
                            в Excel или других аналитических программах
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>💼</div>
                        <h3 className={styles.infoTitle}>Разные виды портфелей</h3>
                        <p className={styles.infoText}>
                            Создавайте портфели под разные стратегии: консервативные,
                            сбалансированные, агрессивные — и управляйте ими
                        </p>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>🛟</div>
                        <h3 className={styles.infoTitle}>Поддержка 24/7</h3>
                        <p className={styles.infoText}>
                            Наша команда поддержки доступна круглосуточно
                            и готова помочь с любым вопросом по платформе
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MainPage;