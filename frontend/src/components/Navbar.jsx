import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import '../assets/styles/Navbar.css';

function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false); 

  const getLinkClass = (path) =>
    location.pathname === path ? 'navbar-link active' : 'navbar-link';

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={`navbar ${isHome ? 'navbar-light' : 'navbar-dark'}`}>
      <div className="navbar-logo">
        <img src={logo} alt="Logo" className="navbar-logo-img" />
        <h1 className="navbar-title">Expedis</h1>
      </div>

      <div className="navbar-toggle" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/" className={getLinkClass('/')} onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/offerts" className={getLinkClass('/offerts')} onClick={() => setMenuOpen(false)}>Offerts</Link></li>
        <li><Link to="/about" className={getLinkClass('/about')} onClick={() => setMenuOpen(false)}>About Us</Link></li>
        <li className="navbar-auth-mobile">
          <Link to="/login" className="navbar-login-button" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="navbar-signup-button" onClick={() => setMenuOpen(false)}>Sign Up</Link>
        </li>
      </ul>

      <div className="navbar-auth">
        <Link to="/login" className="navbar-login-button">Login</Link>
        <Link to="/register" className="navbar-signup-button">Sign Up</Link>
      </div>
    </nav>
  );
}

export default Navbar;
