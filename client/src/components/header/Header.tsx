import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import keycloak from "../../keycloak";
import styles from "./Header.module.css";

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isAdmin, logout } = useAuth();

    const handleLogin = () => keycloak.login();
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const userFirstName = user?.given_name || user?.name || "";
    const userLastName = user?.family_name || "";

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
                    </ul>
                </nav>

                {/* ==================== ПРАВАЯ ЧАСТЬ (АВТОРИЗАЦИЯ) ==================== */}
                <div className={styles.actions}>
                    {isAuthenticated ? (
                        <Dropdown align="end" data-bs-theme="dark">
                            <Dropdown.Toggle
                                variant="link"
                                id="dropdown-user"
                                className={styles.userIconToggle}
                            >
                                <i className="fi fi-sr-user"></i>
                            </Dropdown.Toggle>

                            {/* ✅ Убираем bg-dark, оставляем тему */}
                            <Dropdown.Menu>
                                <Dropdown.Header>
                                    {userFirstName} {userLastName}
                                </Dropdown.Header>
                                <Dropdown.Divider />

                                <Dropdown.Item as={Link} to="/profile">
                                    <i className="fi fi-sr-id-badge me-2"></i> Личный кабинет
                                </Dropdown.Item>

                                {isAdmin && (
                                    <Dropdown.Item as={Link} to="/admin">
                                        <i className="fi fi-sr-star me-2"></i> Админ-панель
                                    </Dropdown.Item>
                                )}

                                <Dropdown.Divider />

                                <Dropdown.Item onClick={handleLogout} className="text-danger">
                                    <i className="fi fi-br-exit me-2"></i> Выйти
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    ) : (
                        <button onClick={handleLogin} className={styles.userIconToggle} title="Войти">
                            <i className="fi fi-sr-sign-in-alt"></i>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;