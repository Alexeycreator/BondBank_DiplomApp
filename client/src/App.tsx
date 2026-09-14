import React from 'react';
import Header from './components/header/Header';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/footer/Footer';

import "./index.module.css";
import MainPage from './components/pages/main/MainPage';
import BondsPage from './components/pages/bondsPage/BondsPage';
import AboutUsPage from './components/pages/aboutUsPage/AboutUsPage';
import PortfoliosPage from './components/pages/portfoliosPage/PortfoliosPage';
import ForecastsPage from './components/pages/forecastsPage/ForecastsPage';
import BadRequestPage from './components/pages/errorPages/BadRequestPage';
import ServerErrorPage from './components/pages/errorPages/ServerErrorPage';
import NotFoundPage from './components/pages/errorPages/NotFoundPage';

function App() {
  return (
    <>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path='/' element={<MainPage />} />
            <Route path='/bonds' element={<BondsPage />} />
            <Route path='/about-us' element={<AboutUsPage />} />
            <Route path='/portfolios' element={<PortfoliosPage />} />
            <Route path='/forecasts' element={<ForecastsPage />} />

            {/* Страницы ошибок */}
            <Route path="/400" element={<BadRequestPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;