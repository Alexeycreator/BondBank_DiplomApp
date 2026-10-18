import React from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface DoughnutChartProps {
    labels: string[];
    data: number[];
    options?: ChartOptions<"doughnut">;
    height?: number;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ labels, data, options, height = 300 }) => {
    const defaultOptions: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: true, 
                position: "bottom" as const,
                labels: { color: "#a0aabf" } // Светлый текст для темной темы
            },
        },
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        plugins: {
            ...defaultOptions.plugins,
            ...options?.plugins,
        },
    };

    // Общая палитра цветов для всех круговых диаграмм
    const chartData = {
        labels,
        datasets: [
            {
                data,
                backgroundColor: [
                    "rgba(79, 195, 247, 0.8)",  // Голубой
                    "rgba(255, 159, 64, 0.8)",   // Оранжевый
                    "rgba(75, 192, 192, 0.8)",   // Бирюзовый
                    "rgba(255, 99, 132, 0.8)",   // Розовый
                    "rgba(153, 102, 255, 0.8)",  // Фиолетовый
                ],
                borderColor: [
                    "rgba(79, 195, 247, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div style={{ height: `${height}px`, width: "100%", position: "relative" }}>
            <Doughnut data={chartData} options={mergedOptions} />
        </div>
    );
};