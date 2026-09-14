import React, { useState } from "react";
import styles from "./Header.module.css";

const Header = () => {
    // Состояние для отображения модальных окон
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // Состояние для выбранной валюты
    const [selectedCurrency, setSelectedCurrency] = useState("RUB");

    // Список доступных валют для выбора
    const currencies = ["RUB", "USD", "EUR", "CNY"];

    // Обработчик изменения валюты
    const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCurrency(event.target.value);
        // Здесь можно добавить логику обновления данных на странице
        console.log(`Валюта изменена на: ${event.target.value}`);
    };

    // Обработчик открытия окна входа
    const handleLoginClick = () => {
        setIsLoginModalOpen(true);
        setIsRegisterModalOpen(false);
    };

    // Обработчик открытия окна регистрации
    const handleRegisterClick = () => {
        setIsRegisterModalOpen(true);
        setIsLoginModalOpen(false);
    };

    // Обработчик закрытия модальных окон
    const handleCloseModals = () => {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    {/* Логотип */}
                    <div className={styles.logo}>
                        <a href="/" className={styles.logoLink}>
                            <span className={styles.logoIcon}>🏦</span>
                            <span className={styles.logoText}>BondBank</span>
                        </a>
                    </div>

                    {/* Навигация */}
                    <nav className={styles.nav}>
                        <ul className={styles.navList}>
                            <li className={styles.navItem}>
                                <a href="/" className={styles.navLink}>Главная</a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="/bonds" className={styles.navLink}>Облигации</a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="/portfolios" className={styles.navLink}>Портфель</a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="/forecasts" className={styles.navLink}>Прогнозы</a>
                            </li>
                            <li className={styles.navItem}>
                                <a href="/about-us" className={styles.navLink}>О нас</a>
                            </li>
                        </ul>
                    </nav>

                    {/* Правая часть: валюта + авторизация */}
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

                        {/* Кнопки входа / регистрации */}
                        <div className={styles.authButtons}>
                            <button
                                className={styles.loginButton}
                                onClick={handleLoginClick}
                            >
                                Войти
                            </button>
                            <button
                                className={styles.registerButton}
                                onClick={handleRegisterClick}
                            >
                                Регистрация
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== МОДАЛЬНОЕ ОКНО ВХОДА ========== */}
            {isLoginModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModals}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.modalClose}
                            onClick={handleCloseModals}
                        >
                            ✕
                        </button>
                        <h2 className={styles.modalTitle}>Вход в систему</h2>
                        <form className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="loginEmail" className={styles.formLabel}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="loginEmail"
                                    className={styles.formInput}
                                    placeholder="example@mail.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="loginPassword" className={styles.formLabel}>
                                    Пароль
                                </label>
                                <input
                                    type="password"
                                    id="loginPassword"
                                    className={styles.formInput}
                                    placeholder="••••••••"
                                />
                            </div>
                            <button type="submit" className={styles.modalSubmit}>
                                Войти
                            </button>
                            <p className={styles.modalSwitch}>
                                Нет аккаунта?{" "}
                                <span
                                    className={styles.modalSwitchLink}
                                    onClick={() => {
                                        setIsLoginModalOpen(false);
                                        setIsRegisterModalOpen(true);
                                    }}
                                >
                                    Зарегистрироваться
                                </span>
                            </p>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== МОДАЛЬНОЕ ОКНО РЕГИСТРАЦИИ ========== */}
            {isRegisterModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModals}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.modalClose}
                            onClick={handleCloseModals}
                        >
                            ✕
                        </button>
                        <h2 className={styles.modalTitle}>Регистрация</h2>
                        <form className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="regName" className={styles.formLabel}>
                                    Полное имя
                                </label>
                                <input
                                    type="text"
                                    id="regName"
                                    className={styles.formInput}
                                    placeholder="Иванов Иван Иванович"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="regEmail" className={styles.formLabel}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="regEmail"
                                    className={styles.formInput}
                                    placeholder="example@mail.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="regPassword" className={styles.formLabel}>
                                    Пароль
                                </label>
                                <input
                                    type="password"
                                    id="regPassword"
                                    className={styles.formInput}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="regConfirmPassword" className={styles.formLabel}>
                                    Подтверждение пароля
                                </label>
                                <input
                                    type="password"
                                    id="regConfirmPassword"
                                    className={styles.formInput}
                                    placeholder="••••••••"
                                />
                            </div>
                            <button type="submit" className={styles.modalSubmit}>
                                Зарегистрироваться
                            </button>
                            <p className={styles.modalSwitch}>
                                Уже есть аккаунт?{" "}
                                <span
                                    className={styles.modalSwitchLink}
                                    onClick={() => {
                                        setIsRegisterModalOpen(false);
                                        setIsLoginModalOpen(true);
                                    }}
                                >
                                    Войти
                                </span>
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;