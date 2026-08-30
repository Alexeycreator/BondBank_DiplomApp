import React from "react";
import styles from "./AboutUsPage.module.css";

const AboutUsPage = () => {
    const team = [
        { name: "Алексей", role: "Разработчик", emoji: "👨‍💻" },
        { name: "Мария", role: "Аналитик", emoji: "📊" },
        { name: "Дмитрий", role: "Data Scientist", emoji: "🤖" },
        { name: "Екатерина", role: "Дизайнер", emoji: "🎨" },
    ];

    return (
        <div className={styles.aboutPage}>
            <h1 className={styles.pageTitle}>ℹ️ О нас</h1>
            <p className={styles.pageDescription}>
                BondBank — это инновационная платформа для инвестиций в облигации
            </p>

            <div className={styles.aboutGrid}>
                <div className={styles.aboutCard}>
                    <h2 className={styles.aboutTitle}>Наша миссия</h2>
                    <p className={styles.aboutText}>
                        Мы помогаем инвесторам принимать обоснованные решения,
                        предоставляя актуальные данные, аналитику и прогнозы
                        по облигациям ведущих мировых бирж.
                    </p>
                </div>

                <div className={styles.aboutCard}>
                    <h2 className={styles.aboutTitle}>Наши ценности</h2>
                    <ul className={styles.valuesList}>
                        <li>🔍 <strong>Прозрачность</strong> — открытые данные и алгоритмы</li>
                        <li>🔒 <strong>Безопасность</strong> — защита ваших инвестиций</li>
                        <li>📈 <strong>Инновации</strong> — использование AI и ML</li>
                        <li>🤝 <strong>Доверие</strong> — надежность и репутация</li>
                    </ul>
                </div>

                <div className={styles.aboutCard}>
                    <h2 className={styles.aboutTitle}>Команда</h2>
                    <div className={styles.teamGrid}>
                        {team.map((member, index) => (
                            <div key={index} className={styles.teamMember}>
                                <span className={styles.teamEmoji}>{member.emoji}</span>
                                <p className={styles.teamName}>{member.name}</p>
                                <p className={styles.teamRole}>{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;