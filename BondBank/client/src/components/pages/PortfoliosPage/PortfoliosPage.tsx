import React from "react";
import styles from "./PortfoliosPage.module.css";

const PortfoliosPage = () => {
    // Моковые данные портфелей
    const portfolios = [
        { id: 1, name: "Консервативный", totalValue: 1450000, bondsCount: 12, yield: 4.2 },
        { id: 2, name: "Агрессивный", totalValue: 2350000, bondsCount: 8, yield: 7.8 },
        { id: 3, name: "Сбалансированный", totalValue: 3200000, bondsCount: 15, yield: 5.6 },
    ];

    // Моковые данные для портфеля "Консервативный"
    const portfolioBonds = [
        { name: "SIJ 4. IZDAJA", isin: "SI0032103580", quantity: 50, price: 98.50, total: 4925 },
        { name: "SDH 3. IZDAJA", isin: "SI0002103529", quantity: 30, price: 97.80, total: 2934 },
        { name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", quantity: 20, price: 96.30, total: 1926 },
    ];

    return (
        <div className={styles.portfoliosPage}>
            <h1 className={styles.pageTitle}>🏦 Портфели</h1>
            <p className={styles.pageDescription}>
                Управляйте своими инвестиционными портфелями
            </p>

            {/* Список портфелей */}
            <section className={styles.portfoliosSection}>
                <h2 className={styles.sectionTitle}>Мои портфели</h2>
                <div className={styles.portfolioGrid}>
                    {portfolios.map((portfolio) => (
                        <div key={portfolio.id} className={styles.portfolioCard}>
                            <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                            <div className={styles.portfolioStats}>
                                <div>
                                    <span className={styles.statLabel}>Стоимость</span>
                                    <span className={styles.statValue}>{portfolio.totalValue.toLocaleString()} ₽</span>
                                </div>
                                <div>
                                    <span className={styles.statLabel}>Облигаций</span>
                                    <span className={styles.statValue}>{portfolio.bondsCount}</span>
                                </div>
                                <div>
                                    <span className={styles.statLabel}>Доходность</span>
                                    <span className={styles.statValue}>{portfolio.yield}%</span>
                                </div>
                            </div>
                            <button className={styles.viewButton}>Подробнее</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Детали портфеля */}
            <section className={styles.detailsSection}>
                <h2 className={styles.sectionTitle}>Портфель: Консервативный</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>ISIN</th>
                                <th>Количество</th>
                                <th>Цена</th>
                                <th>Итого</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolioBonds.map((bond, index) => (
                                <tr key={index}>
                                    <td>{bond.name}</td>
                                    <td className={styles.isin}>{bond.isin}</td>
                                    <td>{bond.quantity}</td>
                                    <td>{bond.price}</td>
                                    <td>{bond.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default PortfoliosPage;