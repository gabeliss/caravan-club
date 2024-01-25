import './styles/App.css';
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer'
import HomePage from "./pages/HomePage";
import TripPage from './pages/TripPage';
import ExplorePage from './pages/ExplorePage';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className={isMenuOpen ? 'blur-effect' : ''}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripPage />} />
            <Route path="/explore" element={<ExplorePage />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

