import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";

/**
 * Шапка приложения
 * Содержит навигацию, выбор валюты, кнопку входа и профиль пользователя
 */
const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isAdmin, logout } = useAuth();

    // Состояние для выбранной валюты
    const [selectedCurrency, setSelectedCurrency] = useState("RUB");

    // Список доступных валют
    const currencies = ["RUB", "USD", "EUR", "CNY"];

    /**
     * Обработчик изменения валюты
     */
    const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCurrency(event.target.value);
        console.log(`Валюта изменена на: ${event.target.value}`);
    };

    /**
     * Обработчик выхода из аккаунта
     */
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* ==================== ЛОГОТИП ==================== */}
                <div className={styles.logo}>
                    <Link to="/" className={styles.logoLink}>
                        <span className={styles.logoIcon}>🏦</span>
                        <span className={styles.logoText}>BondBank</span>
                    </Link>
                </div>

                {/* ==================== НАВИГАЦИЯ ==================== */}
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li className={styles.navItem}>
                            <Link to="/" className={styles.navLink}>Главная</Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link to="/bonds" className={styles.navLink}>Облигации</Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link to="/forecast" className={styles.navLink}>Прогнозы</Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link to="/portfolios" className={styles.navLink}>Портфели</Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link to="/news" className={styles.navLink}>Новости</Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link to="/about" className={styles.navLink}>О нас</Link>
                        </li>
                        {isAdmin && (
                            <li className={styles.navItem}>
                                <Link to="/admin" className={styles.navLink}>👑 Админ-панель</Link>
                            </li>
                        )}
                    </ul>
                </nav>

                {/* ==================== ПРАВАЯ ЧАСТЬ ==================== */}
                <div className={styles.actions}>
                    {/* Выбор валюты */}
                    <div className={styles.currencySelector}>
                        <label htmlFor="currency" className={styles.currencyLabel}>
                            💱
                        </label>
                        <select
                            id="currency"
                            className={styles.currencySelect}
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                        >
                            {currencies.map((curr) => (
                                <option key={curr} value={curr}>
                                    {curr}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Авторизация / Профиль */}
                    {isAuthenticated ? (
                        <div className={styles.userMenu}>
                            <Link to="/profile" className={styles.profileLink}>
                                <span className={styles.userAvatar}>
                                    {user?.firstName?.[0]}{user?.secondName?.[0]}
                                </span>
                                <span className={styles.userName}>
                                    {user?.firstName} {user?.secondName}
                                </span>
                                {isAdmin && <span className={styles.adminBadge}>👑</span>}
                            </Link>
                            <button className={styles.logoutButton} onClick={handleLogout}>
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <Link to="/auth" className={styles.loginButton}>
                                Войти
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;