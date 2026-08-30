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
                        <div className={styles.infoIcon}>🤖</div>
                        <h3 className={styles.infoTitle}>Интеллектуальные прогнозы</h3>
                        <p className={styles.infoText}>
                            Используйте алгоритмы машинного обучения для прогнозирования
                        </p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}>🔒</div>
                        <h3 className={styles.infoTitle}>Безопасность данных</h3>
                        <p className={styles.infoText}>
                            Ваши данные защищены современными методами шифрования
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MainPage;