import React from 'react';
import Header from './components/header/Header';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/footer/Footer';

import "./index.module.css";
import MainPage from './components/pages/main/MainPage';
import BondsPage from './components/pages/BondsPage/BondsPage';
import AboutUsPage from './components/pages/AboutUsPage/AboutUsPage';
import PortfoliosPage from './components/pages/PortfoliosPage/PortfoliosPage';
import ForecastsPage from './components/pages/ForecastsPage/ForecastsPage';

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
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;