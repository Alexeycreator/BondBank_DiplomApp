import React from "react";
import styles from "./InfoCard.module.css";

export interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className={styles.card} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>{icon}</div>
            <h3 className={styles.title} style={{ marginBottom: "10px" }}>{title}</h3>
            <p className={styles.textMuted} style={{ lineHeight: "1.6" }}>
                {description}
            </p>
        </div>
    );
};