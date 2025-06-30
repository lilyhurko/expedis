import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import '../assets/styles/Navbar.css';

function UserNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isHome = location.pathname === '/';

  const getLinkClass = (path) =>
    location.pathname === path ? 'navbar-link active' : 'navbar-link';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
      <li>
          <Link to="/offerts" className={getLinkClass('/offerts')} onClick={() => setMenuOpen(false)}>Offerts</Link>
        </li>
        <li>
          <Link to="/feedback" className={getLinkClass('/feedback')} onClick={() => setMenuOpen(false)}>Feedback</Link>
        </li>
        <li>
          <Link to="/profile" className={getLinkClass('/profile')} onClick={() => setMenuOpen(false)}>Profile</Link>
        </li>
      </ul>

      <div className="navbar-auth">
        <button onClick={handleLogout} className="navbar-login-button">Logout</button>
      </div>
    </nav>
  );
}

export default UserNavbar;
