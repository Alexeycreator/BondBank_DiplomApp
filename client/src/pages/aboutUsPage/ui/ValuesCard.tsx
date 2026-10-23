import React from "react";
import styles from "../../../shared/ui/info-card/InfoCard.module.css";

interface ValueItem {
    icon: string;
    title: string;
    description: string;
}

interface ValuesCardProps {
    title: string;
    values: ValueItem[];
}

export const ValuesCard: React.FC<ValuesCardProps> = ({ title, values }) => {
    return (
        <div className={styles.card}>
            <h2 className={styles.title} style={{ borderBottom: "2px solid #4fc3f7", paddingBottom: "12px", marginBottom: "20px" }}>
                {title}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {values.map((val, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>{val.icon}</span>
                        <div>
                            <strong style={{ color: "#ffffff" }}>{val.title}</strong> 
                            <span className={styles.textMuted}> — {val.description}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};