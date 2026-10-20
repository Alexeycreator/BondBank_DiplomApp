import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import keycloak from "../../keycloak"; // ✅ Импортируем keycloak
import styles from "./Header.module.css";

/**
 * Шапка приложения
 * Содержит навигацию, выбор валюты, кнопку входа и профиль пользователя
 */
const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isAdmin, logout } = useAuth();

    /**
     * Обработчик входа через Keycloak
     */
    const handleLogin = () => {
        // ✅ Вызываем форму входа Keycloak
        keycloak.login();
    };

    /**
     * Обработчик выхода из аккаунта
     */
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // ✅ Извлекаем имя и фамилию из токена Keycloak
    // В Keycloak поля могут называться given_name и family_name
    const userFirstName = user?.given_name || user?.name || "";
    const userLastName = user?.family_name || "";
    const userInitials = `${userFirstName?.[0] || ""}${userLastName?.[0] || ""}`;

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
                    {/* Авторизация / Профиль */}
                    {isAuthenticated ? (
                        <div className={styles.userMenu}>
                            <Link to="/profile" className={styles.profileLink}>
                                <span className={styles.userAvatar}>
                                    {/* ✅ Инициалы из Keycloak */}
                                    {userInitials}
                                </span>
                                <span className={styles.userName}>
                                    {/* ✅ Имя из Keycloak */}
                                    {userFirstName} {userLastName}
                                </span>
                                {isAdmin && <span className={styles.adminBadge}>👑</span>}
                            </Link>
                            <button className={styles.logoutButton} onClick={handleLogout}>
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            {/* ✅ Заменили Link на кнопку с вызовом keycloak.login() */}
                            <button onClick={handleLogin} className={styles.loginButton}>
                                Войти
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;