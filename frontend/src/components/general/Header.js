import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Header({ isMenuOpen, setIsMenuOpen }) {
  const [showTripsDropdown, setShowTripsDropdown] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.classList.toggle('body-no-scroll');
  };

  return (
    <header className='flex-between'>
      <div className="header-left flex-center">
        <Link to="/">
          <button>Home</button>
        </Link>
        <div className="trips-dropdown-container"
             onMouseEnter={() => setShowTripsDropdown(true)}
             onMouseLeave={() => setShowTripsDropdown(false)}>
          <button>Trips</button>
          {showTripsDropdown && (
            <div className="trips-dropdown">
              <Link to="/trips/northernmichigan">
                <button>Northern Michigan</button>
              </Link>
              <button className="dropdown-coming-soon" disabled>Arizona (Coming Soon)</button>
              <button className="dropdown-coming-soon" disabled>Smoky Mountains (Coming Soon)</button>
              <button className="dropdown-coming-soon" disabled>Southern California (Coming Soon)</button>
              <button className="dropdown-coming-soon" disabled>Washington (Coming Soon)</button>
            </div>
          )}
        </div>
        <Link to="/faq">
          <button>FAQ</button>
        </Link>
        <Link to="/media">
          <button>Media</button>
        </Link>
      </div>

      <div className="header-logo">
        <Link to="/">
          <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/header/CaravanTripPlan.png" alt="Caravan Trip Plan" />
        </Link>
      </div>

      <div className="header-right flex-center">
        <a href="http://instagram.com/squarespace" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-instagram header-icon"></i>
        </a>
        <a href="mailto:null" target="_blank" rel="noopener noreferrer">
          <i className="fas fa-envelope header-icon"></i>
        </a>
      </div>
      <div className="header-menu">
        <button className="menu-button" onClick={toggleMenu}>{isMenuOpen ? '✕' : '☰'}</button>
        <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={toggleMenu}><button>Home</button></Link>
          <div className="mobile-trips-dropdown">
            <button onClick={() => setShowTripsDropdown(!showTripsDropdown)}>Trips</button>
            {showTripsDropdown && (
              <>
                <Link to="/trips/northernmichigan" onClick={toggleMenu}>
                  <button className="available-trip">Northern Michigan</button>
                </Link>
                <button className="dropdown-coming-soon" disabled>Arizona (Coming Soon)</button>
                <button className="dropdown-coming-soon" disabled>Smoky Mountain (Coming Soon)</button>
                <button className="dropdown-coming-soon" disabled>Southern California (Coming Soon)</button>
                <button className="dropdown-coming-soon" disabled>Washington (Coming Soon)</button>
              </>
            )}
          </div>
          <Link to="/faq" onClick={toggleMenu}><button>FAQ</button></Link>
          <Link to="/media" onClick={toggleMenu}><button>Media</button></Link>
          <a href="http://instagram.com/squarespace" target="_blank" rel="noopener noreferrer" className="icon-container flex-center" onClick={toggleMenu}>
            <i className="fab fa-instagram header-icon"></i>
          </a>
          <a href="mailto:null" target="_blank" rel="noopener noreferrer" className="icon-container flex-center" onClick={toggleMenu}>
            <i className="fas fa-envelope header-icon"></i>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;