import React from "react";
import styles from "./MainPage.module.css";

const MainPage = () => {
    // Моковые данные для статистики
    const stats = [
        { label: "Всего облигаций", value: "1 284" },
        { label: "Активных пользователей", value: "3 456" },
        { label: "Партнеров", value: "12" },
        { label: "Бирж", value: "4" },
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

            {/* Блок со статистикой */}
            <section className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>Ключевые показатели</h2>
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <p className={styles.statValue}>{stat.value}</p>
                            <p className={styles.statLabel}>{stat.label}</p>
                        </div>
                    ))}
                </div>
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