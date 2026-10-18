import React from "react";
import styles from "./InfoCard.module.css";

interface StatCardProps {
    label: string;
    value: string | number;
    isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, isLoading }) => {
    return (
        <div className={styles.card} style={{ textAlign: "center", padding: "24px 16px" }}>
            {isLoading ? (
                <>
                    <p className={styles.statValue} style={{ color: "#a0aabf" }}>…</p>
                    <p className={styles.statLabel}>Загрузка…</p>
                </>
            ) : (
                <>
                    <p className={styles.statValue} style={{ fontSize: "32px", color: "#4fc3f7", marginBottom: "8px" }}>
                        {value}
                    </p>
                    <p className={styles.statLabel} style={{ fontSize: "14px" }}>
                        {label}
                    </p>
                </>
            )}
        </div>
    );
};