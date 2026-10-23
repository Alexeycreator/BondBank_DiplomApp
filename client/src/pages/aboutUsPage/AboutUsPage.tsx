import React from "react";
import styles from "./AboutUsPage.module.css";
import { MissionCard } from "./ui/MissionCard";
import { ValuesCard } from "./ui/ValuesCard";
import { TeamCard } from "./ui/TeamCard";

const AboutUsPage = () => {
    // ✅ Выносим данные в константы, чтобы не загромождать JSX
    const values = [
        { icon: "🔍", title: "Прозрачность", description: "открытые данные и алгоритмы" },
        { icon: "🔒", title: "Безопасность", description: "защита ваших инвестиций" },
        { icon: "📈", title: "Инновации", description: "использование AI и ML" },
        { icon: "🤝", title: "Доверие", description: "надежность и репутация" },
    ];

    const team = [
        { name: "Алексей", role: "Разработчик", avatar: "👨‍💻" },
        { name: "Мария", role: "Аналитик", avatar: "👩‍💼" },
        { name: "Дмитрий", role: "Data Scientist", avatar: "🧑‍🔬" },
        { name: "Екатерина", role: "Дизайнер", avatar: "👩‍🎨" },
    ];

    return (
        <div className={styles.aboutPage}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>🏛️ О нас</h1>
                <p className={styles.pageDescription}>
                    BondBank — платформа для анализа и прогнозирования рынка облигаций
                </p>
            </div>

            <div className={styles.infoGrid}>
                {/* ✅ Используем новые компоненты */}
                <MissionCard 
                    title="Наша миссия" 
                    description="Мы помогаем инвесторам принимать обоснованные решения, предоставляя актуальные данные, аналитику и прогнозы по облигациям ведущих мировых бирж." 
                />
                
                <ValuesCard 
                    title="Наши ценности" 
                    values={values} 
                />
                
                <TeamCard 
                    title="Команда" 
                    members={team} 
                />
            </div>
        </div>
    );
};

export default AboutUsPage;