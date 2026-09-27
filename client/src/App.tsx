import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import MainPage from './components/pages/mainPage/MainPage';
import BondsPage from './components/pages/bondsPage/BondsPage';
import ForecastsPage from './components/pages/forecastsPage/ForecastsPage';
import PortfoliosPage from './components/pages/portfoliosPage/PortfoliosPage';
import AboutUsPage from './components/pages/aboutUsPage/AboutUsPage';
import AuthPage from './components/pages/authPage/AuthPage';
import ProfilePage from './components/pages/profilePage/ProfilePage';
import NewsPage from './components/pages/newsPage/NewsPage';
import NotFoundPage from './components/pages/errorPages/NotFoundPage';
import BadRequestPage from './components/pages/errorPages/BadRequestPage';
import ServerErrorPage from './components/pages/errorPages/ServerErrorPage';
import AdminPage from './components/pages/adminPage/AdminPage';
import "./index.module.css";

/**
 * Основной компонент приложения BondBank
 *
 * 📋 ФУНКЦИОНАЛЬНОСТЬ ПРИЛОЖЕНИЯ:
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 📊 ИНВЕСТИЦИОННЫЕ ПОРТФЕЛИ                                      │
 * │    Создание, управление и мониторинг портфелей облигаций.       │
 * │    Отслеживание стоимости, доходности и состава портфеля.       │
 * │    Просмотр истории портфеля за прошлые даты.                   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 📈 ПРОГНОЗЫ ЦЕН                                                  │
 * │    Прогнозирование цен облигаций на 2 дня вперёд                │
 * │    (завтра и послезавтра) на основе алгоритмов машинного        │
 * │    обучения (SSA). Указание уровня уверенности прогноза.        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 📥 ИМПОРТ ОБЛИГАЦИЙ                                              │
 * │    Загрузка данных об облигациях из CSV-файлов (доступно        │
 * │    администраторам). Автоматическая проверка дубликатов.        │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 📤 ЭКСПОРТ ОБЛИГАЦИЙ                                             │
 * │    Выгрузка данных об облигациях в CSV-файл (доступно           │
 * │    авторизованным пользователям) для работы в Excel             │
 * │    или других программах.                                       │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 📰 НОВОСТИ                                                       │
 * │    Актуальные новости о биржах, облигациях и аналитике.         │
 * │    Редактирование новостей администратором.                     │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 👤 ПРОФИЛЬ                                                       │
 * │    Управление личными данными, паспортом, ИНН, СНИЛС.           │
 * │    Смена пароля и удаление аккаунта.                            │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ 👑 АДМИН-ПАНЕЛЬ                                                  │
 * │    Управление пользователями (блокировка, удаление).            │
 * │    Управление новостями. Просмотр неактивных пользователей.     │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 🔐 РОЛИ ПОЛЬЗОВАТЕЛЕЙ:
 *
 *   👤 Пользователь:
 *       - Просмотр облигаций
 *       - Экспорт облигаций в CSV
 *       - Создание и управление портфелями
 *       - Просмотр прогнозов цен
 *       - Просмотр новостей
 *       - Управление профилем
 *
 *   👑 Администратор:
 *       - Всё, что доступно пользователю
 *       - Импорт облигаций из CSV
 *       - Управление пользователями
 *       - Управление новостями
 *       - Просмотр логов системы
 */
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="app">
                    <Header />
                    <main className="main">
                        <Routes>
                            {/* ==================== ПУБЛИЧНЫЕ СТРАНИЦЫ ==================== */}
                            {/* Доступны всем посетителям без авторизации */}
                            <Route path="/" element={<MainPage />} />
                            <Route path="/bonds" element={<BondsPage />} />
                            <Route path="/forecast" element={<ForecastsPage />} />
                            <Route path="/about" element={<AboutUsPage />} />
                            <Route path="/news" element={<NewsPage />} />
                            <Route path="/auth" element={<AuthPage />} />

                            {/* ==================== ЗАЩИЩЁННЫЕ СТРАНИЦЫ ==================== */}
                            {/* Портфели — создание, управление, мониторинг портфелей */}
                            <Route
                                path="/portfolios"
                                element={
                                    <ProtectedRoute>
                                        <PortfoliosPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Профиль — личные данные, паспорт, ИНН, СНИЛС */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* ==================== АДМИН-ПАНЕЛЬ ==================== */}
                            {/* Управление пользователями и новостями (только админ) */}
                            <Route
                                path="/admin"
                                element={
                                    <AdminRoute>
                                        <AdminPage />
                                    </AdminRoute>
                                }
                            />

                            {/* ==================== СТРАНИЦЫ ОШИБОК ==================== */}
                            <Route path="/400" element={<BadRequestPage />} />
                            <Route path="/500" element={<ServerErrorPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;