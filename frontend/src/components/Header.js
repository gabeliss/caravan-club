import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
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

      {/* Middle Section - Logo */}
      <div className="header-logo">
        <Link to="/">
          <img src="/images/header/CaravanClub.png" alt="Caravan Club Logo" />
        </Link>
      </div>

      {/* Right Section - Social Icons */}
      <div className="header-right">
        <a href="http://instagram.com/squarespace" target="_blank" rel="noopener noreferrer">
          <img src="/images/header/instagram.png" alt="Instagram Icon" />
        </a>
        <a href="mailto:null" target="_blank" rel="noopener noreferrer">
          <img src="/images/header/mail.png" alt="Mail Icon" />
        </a>
      </div>
    </header>
  );
}

export default Header;