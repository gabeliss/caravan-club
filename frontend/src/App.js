import './styles/App.css';
import React, { useState } from 'react';
import Header from './components/general/Header';
import Footer from './components/general/Footer'
import HomePage from "./pages/HomePage";
import TripPage from './pages/TripPage';
import FAQPage from "./pages/FAQPage";
import MediaPage from "./pages/MediaPage";
import ExplorePage from './pages/ExplorePage';
import BookOptionsPage from "./pages/BookOptionsPage";
import ReviewTripPage from "./pages/ReviewTripPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import Arizona from './pages/trips/Arizona';
import NorthernMichigan from './pages/trips/NorthernMichigan';
import SmokyMountain from './pages/trips/SmokyMountain';
import SouthernCalifornia from './pages/trips/SouthernCalifornia';
import BookNorthernMichiganPage from "./pages/book/BookNorthernMichiganPage";
import AdminPage from "./pages/AdminPage";
import CustomLoader from './components/general/CustomLoader';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className={isMenuOpen ? 'blur-effect' : ''}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/loading" element={<CustomLoader />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/bookoptions" element={<BookOptionsPage />} />
            <Route path="/reviewtrip" element={<ReviewTripPage />} />
            <Route path="/payments" element={<PaymentPage />} />
            <Route path="/payments-confirmation" element={<PaymentConfirmationPage />} />
            <Route path="/trips/arizona" element={<Arizona />} />
            <Route path="/trips/northernmichigan" element={<NorthernMichigan />} />
            <Route path="/trips/smokymountain" element={<SmokyMountain />} />
            <Route path="/trips/southerncalifornia" element={<SouthernCalifornia />} />
            <Route path="/book/northernmichigan" element={<BookNorthernMichiganPage />} />
            <Route path="/caravan-admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

