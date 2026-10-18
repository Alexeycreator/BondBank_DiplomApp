import React, { useEffect, useState } from "react";
import styles from "./MainPage.module.css";
import { getInfoStatisticsBlockData } from "../../data/mainPageApi";
import ErrorCard from "../../errorCard/ErrorCard";
import { InfoStatisticsBlock } from "../../data/types";
import { FeatureCard } from "../../infoCards/FeatureCard";
import { StatCard } from "../../infoCards/StatCard";

const MainPage = () => {
    const [infoStatisticsBlockData, setInfoStatisticsBlockData] = useState<InfoStatisticsBlock | null>(null);
    const [loadingInfoStatisticsBlockData, setLoadingInfoStatisticsBlockData] = useState(true);
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
            const message = err?.serverMessage || err?.message || "Не удалось загрузить статистику. Попробуйте позже.";
            setError({ message, isNetwork });
        } finally {
            setLoadingInfoStatisticsBlockData(false);
        }
    };

    useEffect(() => {
        fetchInfoStatisticsBlockData();
    }, []);

    // ✅ Данные для статистики
    const stats = [
        { label: "Всего облигаций", value: infoStatisticsBlockData?.totalBonds?.toLocaleString("ru-RU") ?? "—" },
        { label: "Активных пользователей", value: infoStatisticsBlockData?.activeUsers?.toLocaleString("ru-RU") ?? "—" },
        { label: "Бирж", value: infoStatisticsBlockData?.exchanges?.toLocaleString("ru-RU") ?? "—" },
    ];

    // ✅ Данные для карточек "О платформе"
    const features = [
        { icon: "📈", title: "Анализ в реальном времени", description: "Отслеживайте изменения цен облигаций в режиме реального времени" },
        { icon: "🔮", title: "Прогноз цен на 2 дня", description: "Система прогнозирует цену облигации на следующие два дня с указанием уровня уверенности на основе ML-модели" },
        { icon: "📥", title: "Импорт файлов", description: "Загружайте облигации из CSV-файлов с автоматической проверкой дубликатов и валидацией данных" },
        { icon: "📤", title: "Экспорт файлов", description: "Выгружайте данные об облигациях в CSV для работы в Excel или других аналитических программах" },
        { icon: "💼", title: "Разные виды портфелей", description: "Создавайте портфели под разные стратегии: консервативные, сбалансированные, агрессивные — и управляйте ими" },
        { icon: "🛟", title: "Поддержка 24/7", description: "Наша команда поддержки доступна круглосуточно и готова помочь с любым вопросом по платформе" }
    ];

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

            {/* ✅ Блок со статистикой (использует StatCard) */}
            <section className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>Ключевые показатели</h2>

                {error ? (
                    <ErrorCard
                        icon={error.isNetwork ? "🛰️" : "⚠️"}
                        title={error.isNetwork ? "Сервер недоступен" : "Не удалось загрузить данные"}
                        message={error.isNetwork ? "Не удаётся связаться с сервером. Проверьте, запущен ли бэкенд, и повторите попытку." : error.message}
                        retryLabel="Повторить"
                        onRetry={fetchInfoStatisticsBlockData}
                    />
                ) : (
                    <div className={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                label={stat.label}
                                value={stat.value}
                                isLoading={loadingInfoStatisticsBlockData}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ✅ Информационные карточки (используют FeatureCard) */}
            <section className={styles.infoSection}>
                <h2 className={styles.sectionTitle}>О платформе</h2>
                <div className={styles.infoGrid}>
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MainPage;