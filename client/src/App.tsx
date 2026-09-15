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

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="app">
                    <Header />
                    <main className="main">
                        <Routes>
                            {/* Публичные страницы */}
                            <Route path="/" element={<MainPage />} />
                            <Route path="/bonds" element={<BondsPage />} />
                            <Route path="/forecast" element={<ForecastsPage />} />
                            <Route path="/about" element={<AboutUsPage />} />
                            <Route path="/news" element={<NewsPage />} />
                            <Route path="/auth" element={<AuthPage />} />

                            {/* Защищённые страницы */}
                            <Route path="/portfolios" element={
                                <ProtectedRoute><PortfoliosPage /></ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute><ProfilePage /></ProtectedRoute>
                            } />

                            <Route path="/admin" element={
                                <AdminRoute><AdminPage /></AdminRoute>
                            } />

                            {/* Страницы ошибок */}
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