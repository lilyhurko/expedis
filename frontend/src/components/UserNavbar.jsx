import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import '../assets/styles/Navbar.css';

function UserNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        setUserRole(null);
      }
    }
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const isHome = location.pathname === '/';
  const getLinkClass = (path) =>
    location.pathname.startsWith(path) ? 'navbar-link active' : 'navbar-link';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
  
  let dashboardLink = null;
  if (userRole === 'admin') {
    dashboardLink = { path: '/admin/dashboard', name: 'Admin Panel' };
  } else if (userRole === 'agency') {
    dashboardLink = { path: '/agency/dashboard', name: 'Agency Dashboard' };
  }
  
  const profileLink = dashboardLink 
    ? dashboardLink 
    : { path: '/profile', name: 'Profile' };

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
          <Link to="/trips" className={getLinkClass('/trips')} onClick={() => setMenuOpen(false)}>Trips</Link>
        </li>
        
        <li>
          <Link to="/rent-car" className={getLinkClass('/rent-car')} onClick={() => setMenuOpen(false)}>Rent Car</Link>
        </li>
        
        <li>
          <Link to="/feedback" className={getLinkClass('/feedback')} onClick={() => setMenuOpen(false)}>Feedback</Link>
        </li>
        
        <li>
          <Link 
            to={profileLink.path} 
            className={location.pathname.startsWith(profileLink.path) ? 'navbar-link active' : 'navbar-link'} 
            onClick={() => setMenuOpen(false)}
          >
            {profileLink.name} 
          </Link>
        </li>
        
      </ul>

      <div className="navbar-auth">
        <button onClick={handleLogout} className="navbar-login-button">Logout</button>
      </div>
    </nav>
  );
}

export default UserNavbar;