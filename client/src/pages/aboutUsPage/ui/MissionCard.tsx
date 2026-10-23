import React from "react";
import styles from "../../../shared/ui/info-card/InfoCard.module.css";

interface MissionCardProps {
    title: string;
    description: string;
}

export const MissionCard: React.FC<MissionCardProps> = ({ title, description }) => {
    return (
        <div className={styles.card}>
            <h2 className={styles.title} style={{ borderBottom: "2px solid #4fc3f7", paddingBottom: "12px", marginBottom: "20px" }}>
                {title}
            </h2>
            <p className={styles.textMuted} style={{ lineHeight: "1.8" }}>
                {description}
            </p>
        </div>
    );
};