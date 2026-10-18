import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import MainPage from "./components/pages/mainPage/MainPage";
import BondsPage from "./components/pages/bondsPage/BondsPage";
import ForecastsPage from "./components/pages/forecastsPage/ForecastsPage";
import PortfoliosPage from "./components/pages/portfoliosPage/PortfoliosPage";
import AboutUsPage from "./components/pages/aboutUsPage/AboutUsPage";
import AuthPage from "./components/pages/authPage/AuthPage";
import ProfilePage from "./components/pages/profilePage/ProfilePage";
import NewsPage from "./components/pages/newsPage/NewsPage";
import NotFoundPage from "./components/pages/errorPages/NotFoundPage";
import BadRequestPage from "./components/pages/errorPages/BadRequestPage";
import ServerErrorPage from "./components/pages/errorPages/ServerErrorPage";
import AdminPage from "./components/pages/adminPage/AdminPage";
import ServerHealthCheck from "./components/serverHealthCheck/ServerHealthCheck";
import { Breadcrumbs } from "./components/breadcrumbs/Breadcrumbs";
import { ToastProvider } from "./components/context/ToastContext";

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <ServerHealthCheck>
                        <div className="app">
                            <Header />
                            <main className="main" style={{ padding: "20px 40px" }}>
                                <Breadcrumbs />
                                <Routes>
                                    {/* ==================== ПУБЛИЧНЫЕ СТРАНИЦЫ ==================== */}
                                    <Route path="/" element={<MainPage />} />
                                    <Route path="/bonds" element={<BondsPage />} />
                                    <Route path="/forecast" element={<ForecastsPage />} />
                                    <Route path="/about" element={<AboutUsPage />} />
                                    <Route path="/news" element={<NewsPage />} />
                                    <Route path="/auth" element={<AuthPage />} />

                                    {/* ==================== ЗАЩИЩЁННЫЕ СТРАНИЦЫ ==================== */}
                                    <Route
                                        path="/portfolios"
                                        element={
                                            <ProtectedRoute>
                                                <PortfoliosPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/profile"
                                        element={
                                            <ProtectedRoute>
                                                <ProfilePage />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* ==================== АДМИН-ПАНЕЛЬ ==================== */}
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
                    </ServerHealthCheck>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;