import { Route, Routes } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "./route-guards";
import MainPage from "../pages/mainPage/MainPage";
import BondsPage from "../pages/bondsPage/BondsPage";
import ForecastsPage from "../pages/forecastsPage/ForecastsPage";
import PortfoliosPage from "../pages/portfolios/ui/PortfoliosPage";
import AboutUsPage from "../pages/aboutUsPage/AboutUsPage";
import ProfilePage from "../pages/profilePage/ProfilePage";
import NewsPage from "../pages/newsPage/NewsPage";
import NotFoundPage from "../pages/errorPages/NotFoundPage";
import BadRequestPage from "../pages/errorPages/BadRequestPage";
import ServerErrorPage from "../pages/errorPages/ServerErrorPage";
import AdminPage from "../pages/adminPage/AdminPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/bonds" element={<BondsPage />} />
            <Route path="/forecast" element={<ForecastsPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/portfolios" element={<PortfoliosPage />} />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminPage />
                    </AdminRoute>
                }
            />
            <Route path="/400" element={<BadRequestPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
