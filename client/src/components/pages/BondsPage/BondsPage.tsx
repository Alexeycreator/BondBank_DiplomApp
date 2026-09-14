import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import styles from "./BondsPage.module.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const BondsPage = () => {
    // Моковые данные для таблицы облигаций
    const bondsData = [
        { id: 1, name: "SIJ 4. IZDAJA", isin: "SI0032103580", price: 98.50, yield: 4.2, maturity: "2028-06-15" },
        { id: 2, name: "SIJ 5. IZDAJA", isin: "SI0032103598", price: 99.20, yield: 3.8, maturity: "2029-07-20" },
        { id: 3, name: "SDH 3. IZDAJA", isin: "SI0002103529", price: 97.80, yield: 5.1, maturity: "2027-11-01" },
        { id: 4, name: "TELEKOM SLOVENIJE", isin: "SI0032103630", price: 101.50, yield: 3.2, maturity: "2030-03-10" },
        { id: 5, name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", price: 96.30, yield: 4.9, maturity: "2028-09-05" },
    ];

    // Моковые данные для графика (динамика цены)
    const chartData = {
        labels: ["Авг 01", "Авг 03", "Авг 05", "Авг 07", "Авг 09", "Авг 11", "Авг 13"],
        datasets: [
            {
                label: "Цена облигации",
                data: [97.2, 98.1, 97.8, 98.5, 99.0, 98.7, 99.3],
                borderColor: "#4fc3f7",
                backgroundColor: "rgba(79, 195, 247, 0.1)",
                fill: true,
                tension: 0.3,
                pointBackgroundColor: "#4fc3f7",
            },
        ],
    };

    // ✅ Исправленные опции графика
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Динамика цены облигации (SI0032103580)",
                font: {
                    size: 16,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                // ✅ Исправленный callback с правильным типом
                ticks: {
                    callback: function(value: string | number) {
                        return `${value}%`;
                    },
                },
            },
        },
    };

    return (
        <div className={styles.bondsPage}>
            {/* Заголовок страницы */}
            <h1 className={styles.pageTitle}>📈 Облигации</h1>
            <p className={styles.pageDescription}>
                Список доступных облигаций и график динамики цены
            </p>

            {/* График */}
            <section className={styles.chartSection}>
                <div className={styles.chartContainer}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </section>

            {/* Таблица облигаций */}
            <section className={styles.tableSection}>
                <h2 className={styles.sectionTitle}>Список облигаций</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>ISIN</th>
                                <th>Цена</th>
                                <th>Доходность</th>
                                <th>Дата погашения</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bondsData.map((bond) => (
                                <tr key={bond.id}>
                                    <td>{bond.id}</td>
                                    <td>{bond.name}</td>
                                    <td className={styles.isin}>{bond.isin}</td>
                                    <td>{bond.price}</td>
                                    <td className={bond.yield > 4.5 ? styles.yieldHigh : styles.yieldLow}>
                                        {bond.yield}%
                                    </td>
                                    <td>{bond.maturity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default BondsPage;