import './styles/App.css';
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer'
import HomePage from "./pages/HomePage";
import TripPage from './pages/TripPage';
import BookPage from "./pages/BookPage";
import ExplorePage from './pages/ExplorePage';
import Arizona from './pages/trips/Arizona';
import NorthernMichigan from './pages/trips/NorthernMichigan';
import SmokyMountain from './pages/trips/SmokyMountain';
import SouthernCalifornia from './pages/trips/SouthernCalifornia';
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
            <Route path="/book" element={<BookPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/trips/arizona" element={<Arizona />} />
            <Route path="/trips/northernmichigan" element={<NorthernMichigan />} />
            <Route path="/trips/smokymountain" element={<SmokyMountain />} />
            <Route path="/trips/southerncalifornia" element={<SouthernCalifornia />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

