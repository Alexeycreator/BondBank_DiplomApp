import React from "react";

export type BadgeVariantType =
  | "type"
  | "yield"
  | "role"
  | "status"
  | "capacity"
  | "confidence";

interface StatusBadgeProps {
  variantType: BadgeVariantType;
  value: string | number | boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variantType,
  value,
  className = "",
}) => {
  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 700, // Сделали жирнее для читаемости
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  };

  const getBadgeConfig = () => {
    const strValue = String(value).toLowerCase();

    switch (variantType) {
      case "role":
        if (strValue === "admin")
          return {
            text: "👑 Админ",
            bg: "rgba(234, 179, 8, 0.2)",
            color: "#facc15",
            border: "1px solid rgba(234, 179, 8, 0.4)",
          };
        return {
          text: "👤 Пользователь",
          bg: "rgba(148, 163, 184, 0.2)",
          color: "#cbd5e1",
          border: "1px solid rgba(148, 163, 184, 0.4)",
        };

      case "status":
        if (strValue === "active")
          return {
            text: "✅ Активен",
            bg: "rgba(34, 197, 94, 0.2)",
            color: "#4ade80",
            border: "1px solid rgba(34, 197, 94, 0.4)",
          };
        if (strValue === "blocked")
          return {
            text: "🚫 Заблокирован",
            bg: "rgba(239, 68, 68, 0.2)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.4)",
          };
        if (strValue === "inactive")
          return {
            text: "⚠️ Неактивен",
            bg: "rgba(249, 115, 22, 0.2)",
            color: "#fb923c",
            border: "1px solid rgba(249, 115, 22, 0.4)",
          };
        if (strValue === "modified")
          return {
            text: "✏️ Изменено",
            bg: "rgba(56, 189, 248, 0.2)",
            color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.4)",
          };
        return {
          text: String(value),
          bg: "transparent",
          color: "inherit",
          border: "1px solid transparent",
        };

      case "type":
        const typeMap: Record<string, { bg: string; color: string }> = {
          lse: { bg: "#0ea5e9", color: "#fff" },
          wb: { bg: "#8b5cf6", color: "#fff" },
          sg: { bg: "#10b981", color: "#fff" },
          me: { bg: "#f59e0b", color: "#fff" },
        };
        const t = typeMap[strValue] || { bg: "#64748b", color: "#fff" };
        return {
          text: strValue.toUpperCase(),
          bg: t.bg,
          color: t.color,
          border: "none",
        };

      case "yield":
        const num = Number(value);
        if (num >= 7)
          return {
            text: `${num}%`,
            bg: "rgba(34, 197, 94, 0.2)",
            color: "#4ade80",
            border: "1px solid rgba(34, 197, 94, 0.4)",
          };
        if (num >= 4)
          return {
            text: `${num}%`,
            bg: "rgba(234, 179, 8, 0.2)",
            color: "#facc15",
            border: "1px solid rgba(234, 179, 8, 0.4)",
          };
        return {
          text: `${num}%`,
          bg: "rgba(239, 68, 68, 0.2)",
          color: "#f87171",
          border: "1px solid rgba(239, 68, 68, 0.4)",
        };

      case "confidence":
        if (strValue === "высокая")
          return {
            text: "Высокая",
            bg: "rgba(34, 197, 94, 0.15)",
            color: "#4ade80",
            border: "1px solid rgba(34, 197, 94, 0.3)",
          };
        if (strValue === "средняя")
          return {
            text: "Средняя",
            bg: "rgba(234, 179, 8, 0.15)",
            color: "#facc15",
            border: "1px solid rgba(234, 179, 8, 0.3)",
          };
        if (strValue === "низкая")
          return {
            text: "Низкая",
            bg: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          };
        return {
          text: String(value),
          bg: "rgba(148, 163, 184, 0.15)",
          color: "#cbd5e1",
          border: "1px solid rgba(148, 163, 184, 0.3)",
        };

      default:
        return {
          text: String(value),
          bg: "transparent",
          color: "inherit",
          border: "1px solid transparent",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={className}
      style={{
        ...baseStyle,
        backgroundColor: config.bg,
        color: config.color,
        border: config.border,
      }}
    >
      {config.text}
    </span>
  );
};
