import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer>
      <div className="footer-left">
        <a href="mailto:caravantripplan@gmail.com">caravantripplan@gmail.com</a>
        <a href="tel:+12489047411">(248) 904-7411</a>
      </div>
      <div className="footer-center">
        <Link to="/">
          <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/header/CaravanTripPlan.png" alt="Caravan Club Logo" />
        </Link>
      </div>
      <div className="footer-right">
        <a href="https://www.instagram.com/caravantripplan" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">Tiktok</a>
      </div>
    </footer>
  );
}

export default Footer;