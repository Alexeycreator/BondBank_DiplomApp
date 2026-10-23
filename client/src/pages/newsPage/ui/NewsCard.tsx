import React from "react";
import { Badge } from "react-bootstrap"; // ✅ Обязательно импортируем Badge
import styles from "../../../shared/ui/info-card/InfoCard.module.css";
import { News } from "../../../entities/news/model/types";

export type { News } from "../../../entities/news/model/types";

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