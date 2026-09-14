import React from "react";
import styles from "./ForecastsPage.module.css";

const ForecastsPage = () => {
    // Моковые данные прогнозов
    const forecasts = [
        { isin: "SI0032103580", name: "SIJ 4. IZDAJA", currentPrice: 98.50, forecastPrice: 99.80, change: "+1.3%", confidence: "Высокая" },
        { isin: "SI0032103598", name: "SIJ 5. IZDAJA", currentPrice: 99.20, forecastPrice: 100.50, change: "+1.3%", confidence: "Средняя" },
        { isin: "SI0002103529", name: "SDH 3. IZDAJA", currentPrice: 97.80, forecastPrice: 96.20, change: "-1.6%", confidence: "Высокая" },
        { isin: "SI0032103630", name: "TELEKOM SLOVENIJE", currentPrice: 101.50, forecastPrice: 103.20, change: "+1.7%", confidence: "Низкая" },
    ];

    return (
        <div className={styles.forecastsPage}>
            <h1 className={styles.pageTitle}>📊 Прогнозы</h1>
            <p className={styles.pageDescription}>
                Прогнозы цен облигаций на основе алгоритмов машинного обучения
            </p>

            <div className={styles.forecastGrid}>
                {forecasts.map((item, index) => (
                    <div key={index} className={styles.forecastCard}>
                        <div className={styles.forecastHeader}>
                            <span className={styles.forecastIsin}>{item.isin}</span>
                            <span className={`${styles.forecastChange} ${item.change.startsWith("+") ? styles.positive : styles.negative}`}>
                                {item.change}
                            </span>
                        </div>
                        <h3 className={styles.forecastName}>{item.name}</h3>
                        <div className={styles.forecastPrices}>
                            <div>
                                <span className={styles.priceLabel}>Текущая</span>
                                <span className={styles.currentPrice}>{item.currentPrice}</span>
                            </div>
                            <div>
                                <span className={styles.priceLabel}>Прогноз</span>
                                <span className={styles.forecastPrice}>{item.forecastPrice}</span>
                            </div>
                        </div>
                        <div className={styles.forecastConfidence}>
                            Уверенность: <span className={styles.confidenceValue}>{item.confidence}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForecastsPage;