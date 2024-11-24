import React from 'react';
import { Link } from 'react-router-dom';

function Header({ isMenuOpen, setIsMenuOpen }) {

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className='flex-between'>
      <div className="header-left flex-center">
        <Link to="/">
          <button>Home</button>
        </Link>
        <Link to="/trips">
          <button>Trips</button>
        </Link>
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
          <Link to="/trips" onClick={toggleMenu}><button>Trips</button></Link>
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