import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Footer2.css';

function Footer() {
  return (
    <footer className="footer2">
      <div className="footer-container">
        <div className="footer-left">
          <p>Get in touch with us</p>
          <a href="mailto:contact@expedis.travel">contact@expedis.travel</a>
          <h2 className="footer-logo">Expedis</h2>
        </div>

        <div className="footer-center">
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/trips">Trips</Link></li>
            <li><Link to="/rent-car">Rent Car</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
          </ul>
        </div>

        <div className="footer-right">
          <p>Lublin, ul. Nadbystrzycka 39</p>
          <p>(+48) 123-456-789</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Expedis. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
