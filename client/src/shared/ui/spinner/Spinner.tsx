import React from "react";
import styles from "./Spinner.module.css";

export interface SpinnerProps {
    /** Размер спиннера: small | medium | large */
    size?: "small" | "medium" | "large";
    /** Текст под спиннером (опционально) */
    label?: string;
    /** Цвет: primary | light | inherit */
    variant?: "primary" | "light" | "inherit";
    /** Дополнительный CSS-класс */
    className?: string;
    /** Полноэкранный режим — центрирует спиннер по вертикали и горизонтали */
    fullScreen?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
    size = "medium",
    label,
    variant = "primary",
    className,
    fullScreen = false,
}) => {
    return (
        <div
            className={[
                styles.wrapper,
                fullScreen ? styles.fullScreen : "",
                className ?? "",
            ].join(" ").trim()}
            role="status"
            aria-live="polite"
        >
            <div
                className={[
                    styles.spinner,
                    styles[size],
                    styles[variant],
                ].join(" ")}
            />
            {label && <p className={styles.label}>{label}</p>}
        </div>
    );
};

export default Spinner;