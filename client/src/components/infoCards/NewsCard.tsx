import React from "react";
import { Badge } from "react-bootstrap"; // ✅ Обязательно импортируем Badge
import styles from "./InfoCard.module.css";

// ==================== ЛОКАЛЬНЫЕ ТИПЫ ====================
export interface News {
    id: number;
    title: string;
    content: string;
    author: string;
    date: string;
    category: string;
}

// ✅ Функция для генерации моковых новостей
export const getMockNews = (): News[] => {
    return [
        { id: 1, title: "Московская биржа запустила новый тип облигаций", content: "Московская биржа объявила о запуске нового типа облигаций с плавающей ставкой, что позволит инвесторам получать более высокий доход при изменении ключевой ставки ЦБ.", author: "admin", date: "2026-09-10", category: "Биржи" },
        { id: 2, title: "Венская биржа показывает рост на 3%", content: "Индекс Венской биржи вырос на 3% за неделю благодаря позитивным новостям от крупных эмитентов и улучшению макроэкономических показателей региона.", author: "admin", date: "2026-09-08", category: "Облигации" },
        { id: 3, title: "SIX Group анонсировала новые правила торговли", content: "Швейцарская биржа SIX Group анонсировала изменения в правилах торговли облигациями, направленные на повышение прозрачности и снижение рисков для участников рынка.", author: "admin", date: "2026-09-05", category: "Биржи" },
        { id: 4, title: "Прогноз рынка облигаций на 2027 год", content: "Аналитики BondBank подготовили прогноз развития рынка облигаций на 2027 год. Ожидается рост доходности в корпоративном секторе и стабилизация в государственном.", author: "admin", date: "2026-09-01", category: "Аналитика" },
    ];
};

// ==================== КОМПОНЕНТ ====================
interface NewsCardProps {
    news: News;
    onClick?: (news: News) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
    const getBadgeBg = (category: string) => {
        switch (category.toLowerCase()) {
            case "биржи": return "primary";
            case "облигации": return "success";
            case "аналитика": return "warning";
            default: return "secondary";
        }
    };

    return (
        <div 
            className={styles.card} 
            onClick={() => onClick && onClick(news)}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
                <Badge bg={getBadgeBg(news.category)} pill style={{ fontSize: "0.85em", padding: "0.4em 0.8em" }}>
                    {news.category.toUpperCase()}
                </Badge>
                <span className={styles.meta} style={{ margin: 0 }}>{news.date}</span>
            </div>

            <h3 className={styles.title}>{news.title}</h3>
            
            <p className={styles.textMuted} style={{ marginBottom: "20px", flexGrow: 1 }}>
                {news.content}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
                <span>✍️</span>
                <span className={styles.meta} style={{ margin: 0 }}>{news.author}</span>
            </div>
        </div>
    );
};

export default NewsCard;