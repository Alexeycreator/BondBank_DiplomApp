import React from "react";
import styles from "../../../shared/ui/info-card/InfoCard.module.css";
import { News } from "../../../entities/news/model/types";

export type { News } from "../../../entities/news/model/types";

// ==================== КОМПОНЕНТ ====================
interface NewsCardProps {
    news: News;
    onClick?: (news: News) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
    const formattedDate = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(news.date));

    return (
        <article className={styles.card}>
            {news.image && (
                <img className={styles.image} src={news.image} alt={news.title} loading="lazy" />
            )}
            <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                    <span className={styles.category}>{news.category}</span>
                    <time className={styles.meta} dateTime={news.date}>{formattedDate}</time>
                </div>
                <h2 className={styles.title}>{news.title}</h2>
                <p className={styles.textMuted}>{news.body}</p>
                {onClick && (
                    <button className={styles.readMore} type="button" onClick={() => onClick(news)}>
                        Читать новость <span aria-hidden="true">→</span>
                    </button>
                )}
            </div>
        </article>
    );
};

export default NewsCard;