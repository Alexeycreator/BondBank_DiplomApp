import React from "react";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface LineChartProps {
    labels: string[];
    datasets: any[]; // Можно типизировать строже, но для гибкости оставим any
    options?: ChartOptions<"line">;
    height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ labels, datasets, options, height = 300 }) => {
    // Базовые опции, которые применяются ко всем линейным графикам
    const defaultOptions: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: "top" as const },
            tooltip: {
                backgroundColor: "rgba(26, 26, 46, 0.9)",
                titleColor: "#ffffff",
                bodyColor: "#e0e0e0",
                borderColor: "#4fc3f7",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255, 255, 255, 0.05)" }, // Темная сетка
                ticks: { color: "#a0aabf" }, // Светлые подписи
            },
            y: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: { color: "#a0aabf" },
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