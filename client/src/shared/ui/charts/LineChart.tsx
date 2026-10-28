import React from "react";
import { Line } from "react-chartjs-2";
import { ChartDataset, ChartOptions } from "chart.js";
import { useTheme } from "../../theme/ThemeContext";

interface LineChartProps {
    labels: string[];
    datasets: ChartDataset<"line", (number | null)[]>[];
    options?: ChartOptions<"line">;
    height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ labels, datasets, options, height = 300 }) => {
    const { theme } = useTheme();
    const textColor = theme === "dark" ? "#a0aabf" : "#5f6b7c";
    const tooltipBackground = theme === "dark" ? "rgba(26, 26, 46, 0.95)" : "rgba(255, 255, 255, 0.97)";
    const tooltipText = theme === "dark" ? "#ffffff" : "#172033";
    const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(23, 32, 51, 0.1)";
    // Базовые опции, которые применяются ко всем линейным графикам
    const defaultOptions: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: "top" as const },
            tooltip: {
                backgroundColor: tooltipBackground,
                titleColor: tooltipText,
                bodyColor: textColor,
                borderColor: theme === "dark" ? "#4fc3f7" : "#087eae",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: { color: gridColor },
                ticks: { color: textColor },
            },
            y: {
                grid: { color: gridColor },
                ticks: { color: textColor },
                beginAtZero: false,
            },
        },
    };

    // Объединяем базовые опции с теми, что передал пользователь
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        plugins: {
            ...defaultOptions.plugins,
            ...options?.plugins,
        },
        scales: {
            ...defaultOptions.scales,
            ...options?.scales,
        },
    };

    return (
        <div style={{ height: `${height}px`, width: "100%", position: "relative" }}>
            <Line data={{ labels, datasets }} options={mergedOptions} />
        </div>
    );
};