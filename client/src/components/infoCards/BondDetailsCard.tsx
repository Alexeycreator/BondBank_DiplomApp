import React from "react";
import styles from "./InfoCard.module.css";

export interface BondDetailRow {
    label: string;
    value: React.ReactNode;
    isHighlight?: boolean; // Если true, значение выделяется голубым (как Цена)
}

interface BondDetailsCardProps {
    title: string;
    rows: BondDetailRow[];
}

export const BondDetailsCard: React.FC<BondDetailsCardProps> = ({ title, rows }) => {
    return (
        <div className={styles.card} style={{ height: "100%", overflowY: "auto" }}>
            <h2 className={styles.title} style={{ borderBottom: "2px solid #4fc3f7", paddingBottom: "12px", marginBottom: "20px" }}>
                {title}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {rows.map((row, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            paddingBottom: "8px",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                        }}
                    >
                        <span style={{ color: "#a0aabf", fontSize: "13px" }}>{row.label}:</span>
                        <span style={{ 
                            color: row.isHighlight ? "#4fc3f7" : "#ffffff", 
                            fontWeight: row.isHighlight ? 700 : 500, 
                            fontSize: row.isHighlight ? "16px" : "14px",
                            textAlign: "right"
                        }}>
                            {row.value ?? "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};