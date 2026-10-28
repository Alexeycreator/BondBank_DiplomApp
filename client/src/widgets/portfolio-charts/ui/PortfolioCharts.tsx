import React from "react";
import { ActiveElement, ChartEvent, TooltipItem } from "chart.js";
import styles from "./PortfolioCharts.module.css";
import { LineChart } from "../../../shared/ui/charts/LineChart";
import { DoughnutChart } from "../../../shared/ui/charts/DoughnutChart";
import { Portfolio, PortfolioHistory } from "../../../entities/portfolio/model/types";
import { useTheme } from "../../../shared/theme/ThemeContext";

interface PortfolioChartsProps {
    selectedPortfolio: Pick<Portfolio, "id">;
    portfolioHistory: Record<number, PortfolioHistory[]>;
    selectedDate: string;
    isHistoricalView: boolean;
    onDateChange: (date: string) => void;
    getTypeDistribution: () => Record<string, number>;
}

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
    selectedPortfolio,
    portfolioHistory,
    selectedDate,
    isHistoricalView,
    onDateChange,
    getTypeDistribution,
}) => {
    const { theme } = useTheme();
    const chartTextColor = theme === "dark" ? "#ffffff" : "#172033";
    const chartMutedColor = theme === "dark" ? "#a0aabf" : "#5f6b7c";
    const history = portfolioHistory[selectedPortfolio.id] || [];

    // Данные для графика стоимости
    const valueLabels = history.map((h) => {
        const date = new Date(h.date);
        return `${date.getDate()}.${date.getMonth() + 1}`;
    });

    const valueDatasets = [
        {
            label: "Стоимость портфеля (₽)",
            data: history.map((h) => h.totalValue),
            borderColor: isHistoricalView ? "#ff9800" : "#2ecc71",
            backgroundColor: isHistoricalView ? "rgba(255, 152, 0, 0.1)" : "rgba(46, 204, 113, 0.1)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: history.map((h) =>
                h.date === selectedDate ? "#e74c3c" : isHistoricalView ? "#ff9800" : "#2ecc71"
            ),
            pointRadius: history.map((h) => (h.date === selectedDate ? 8 : 4)),
            pointHoverRadius: 10,
        },
    ];

    // Данные для графика доходности
    const yieldDatasets = [
        {
            label: "Доходность портфеля (%)",
            data: history.map((h) => Number(h.yield.toFixed(2))),
            borderColor: "#4fc3f7",
            backgroundColor: "rgba(79, 195, 247, 0.1)",
            fill: true,
            tension: 0.3,
        },
    ];

    // Данные для круговой диаграммы
    const distribution = getTypeDistribution();
    const doughnutLabels = Object.keys(distribution).map((t) => t.toUpperCase());
    const doughnutData = Object.values(distribution);

    return (
        <div className={styles.chartsLayout}>
            <div className={styles.chartsLeft}>
                <div className={styles.chartCard}>
                    <p className={styles.chartHint}>
                        💡 Нажмите на точку, чтобы переключиться на дату
                    </p>
                    <LineChart
                        labels={valueLabels}
                        datasets={valueDatasets}
                        options={{
                            plugins: {
                                legend: { labels: { color: chartMutedColor } },
                                tooltip: {
                                    callbacks: {
                                        label: (context: TooltipItem<"line">) => `Стоимость: ${Number(context.raw).toLocaleString("ru-RU")} ₽`,
                                    },
                                },
                            },
                            onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
                                if (elements.length > 0) {
                                    const index = elements[0].index;
                                    if (history[index]) onDateChange(history[index].date);
                                }
                            },
                            scales: {
                                x: { ticks: { color: chartMutedColor } },
                                y: {
                                    ticks: {
                                        color: chartMutedColor,
                                        callback: (value: string | number) => `${Number(value).toLocaleString("ru-RU")} ₽`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
                <div className={styles.chartCard}>
                    <LineChart
                        labels={valueLabels}
                        datasets={yieldDatasets}
                        options={{
                            plugins: {
                                legend: { labels: { color: chartMutedColor } },
                            },
                            scales: {
                                x: { ticks: { color: chartMutedColor } },
                                y: {
                                    ticks: {
                                        color: chartMutedColor,
                                        callback: (value: string | number) => `${value}%`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>
            <div className={styles.chartsRight}>
                <div className={styles.chartCard}>
                    <DoughnutChart
                        labels={doughnutLabels}
                        data={doughnutData}
                        options={{
                            plugins: {
                                title: {
                                    display: true,
                                    text: "Распределение по типам облигаций",
                                    color: chartTextColor,
                                    font: { size: 14 },
                                },
                                legend: { labels: { color: chartMutedColor } },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};