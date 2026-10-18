import React from "react";
import styles from "./InfoCard.module.css";

interface TeamMember {
    name: string;
    role: string;
    avatar: string; // Эмодзи или URL картинки
}

interface TeamCardProps {
    title: string;
    members: TeamMember[];
}

export const TeamCard: React.FC<TeamCardProps> = ({ title, members }) => {
    return (
        <div className={styles.card}>
            <h2 className={styles.title} style={{ borderBottom: "2px solid #4fc3f7", paddingBottom: "12px", marginBottom: "20px" }}>
                {title}
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {members.map((member, idx) => (
                    <div 
                        key={idx} 
                        style={{ 
                            background: "rgba(255, 255, 255, 0.03)", 
                            padding: "16px", 
                            borderRadius: "8px", 
                            textAlign: "center",
                            border: "1px solid rgba(255, 255, 255, 0.05)"
                        }}
                    >
                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{member.avatar}</div>
                        <div style={{ fontWeight: 600, color: "#ffffff", fontSize: "15px" }}>{member.name}</div>
                        <div className={styles.textMuted} style={{ fontSize: "12px" }}>{member.role}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};