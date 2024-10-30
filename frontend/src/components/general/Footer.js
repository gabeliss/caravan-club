import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer>
      <div className="footer-left">
        <a href="mailto:email@example.com">email@example.com</a>
        <a href="tel:+15555555555">(555) 555-5555</a>
      </div>
      <div className="footer-center">
        <Link to="/">
          <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/header/CaravanClub.png" alt="Caravan Club Logo" />
        </Link>
      </div>
      <div className="footer-right">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
    </footer>
  );
}

export default Footer;