import React, {useState} from 'react';
import { Link } from 'react-router-dom';

function Header({ isMenuOpen, setIsMenuOpen }) {

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className="header-left">
        <Link to="/trips">
          <button>Trips</button>
        </Link>
        <Link to="/book">
          <button>Book</button>
        </Link>
        <Link to="/media">
          <button>Media</button>
        </Link>
      </div>

      <div className="header-logo">
        <Link to="/">
          <img src="/images/header/CaravanClub.png" alt="Caravan Club Logo" />
        </Link>
      </div>

      <div className="header-right">
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
          <Link to="/trips"><button>Trips</button></Link>
          <Link to="/book"><button>Book</button></Link>
          <Link to="/media"><button>Media</button></Link>
          <a href="http://instagram.com/squarespace" target="_blank" rel="noopener noreferrer" class="icon-container">
            <i className="fab fa-instagram header-icon"></i>
          </a>
          <a href="mailto:null" target="_blank" rel="noopener noreferrer" class="icon-container">
            <i className="fas fa-envelope header-icon"></i>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;