import React from "react";
import { Badge } from "react-bootstrap";

interface StatusBadgeProps {
    /** Тип бейджа: 'type' для бирж (LSE, WB), 'yield' для доходности */
    variantType?: "type" | "yield" | "custom";
    /** Значение (например, 'lse', '4.2', 'Высокая') */
    value: string | number;
    /** Если variantType === 'custom', можно передать свой цвет (Bootstrap-вариант) */
    customBg?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    /** Текст внутри бейджа (если не задан, будет использован value) */
    children?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
    variantType = "type", 
    value, 
    customBg,
    children 
}) => {
    // Функция для подбора цвета биржи
    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "lse": return "primary";
            case "wb": return "warning";
            case "sg": return "success";
            case "me": return "danger";
            default: return "secondary";
        }
    };

    // Функция для подбора цвета доходности
    const getYieldColor = (yieldVal: number) => {
        if (yieldVal > 5) return "success"; // Высокая
        if (yieldVal > 3) return "warning"; // Средняя
        return "danger"; // Низкая
    };

    let bg: any = "secondary";
    
    if (variantType === "type") {
        bg = getTypeColor(String(value));
    } else if (variantType === "yield") {
        bg = getYieldColor(Number(value));
    } else if (variantType === "custom" && customBg) {
        bg = customBg;
    }

    return (
        <Badge bg={bg} pill style={{ fontSize: "0.85em", padding: "0.4em 0.8em" }}>
            {children || (variantType === "type" ? String(value).toUpperCase() : value)}
        </Badge>
    );
};