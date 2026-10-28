import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { CurrencySelector } from "../../../shared/ui/currency-selector/CurrencySelector"; // ✅ Импорт
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, logout, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userFirstName = user?.given_name || user?.name || "";
  const userLastName = user?.family_name || "";

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logoIcon}>🏦</span>
            <span className={styles.logoText}>BondBank</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink
                to="/bonds"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                }
              >
                Облигации
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="/forecast"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                }
              >
                Прогнозы
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="/portfolios"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                }
              >
                Портфели
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="/news"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                }
              >
                Новости
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                }
              >
                О нас
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className={styles.actions}>
          {/* ✅ Добавили выбор валюты */}
          <CurrencySelector />

          <button
            type="button"
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Включить ${theme === "dark" ? "светлую" : "тёмную"} тему`}
            aria-pressed={theme === "light"}
            title={`Тема: ${theme === "dark" ? "тёмная" : "светлая"}`}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>
          </button>
          {isAuthenticated ? (
            <Dropdown align="end" data-bs-theme={theme}>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-user"
                className={styles.userIconToggle}
              >
                <i className="fi fi-sr-user"></i>
              </Dropdown.Toggle>
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
            <button
              onClick={login}
              className={styles.userIconToggle}
              title="Войти"
            >
              <i className="fi fi-sr-sign-in-alt"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
