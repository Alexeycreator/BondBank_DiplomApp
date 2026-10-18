import React from "react";
import { Badge } from "react-bootstrap";

interface CapacityBadgeProps {
    current: number;
    max: number;
}

export const CapacityBadge: React.FC<CapacityBadgeProps> = ({ current, max }) => {
    // Считаем процент заполнения
    const percentage = (current / max) * 100;
    
    let bg: "success" | "warning" | "danger" = "success";

    if (percentage >= 90) {
        bg = "danger"; // Красный (почти заполнен)
    } else if (percentage >= 70) {
        bg = "warning"; // Рыжий/Оранжевый (средняя заполненность)
    } else {
        bg = "success"; // Зеленый (много места)
    }

    return (
        <Badge bg={bg} pill style={{ fontSize: "0.85em", padding: "0.4em 0.8em" }}>
            {current}/{max}
        </Badge>
    );
};