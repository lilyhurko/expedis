import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '../assets/styles/Profile.module.css';
import { FaUser, FaWallet, FaBriefcase, FaHeart } from 'react-icons/fa';

function Profile() {
  return (
    <div className={styles.profilePageContainer}>
      <h2 className={styles.pageTitle}>My Account</h2>
      <div className={styles.profileLayout}>
        
        <nav className={styles.sidebarNav}>
          <NavLink 
            to="/profile" 
            end 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <FaUser />
            <span>Profile Details</span>
          </NavLink>
          
          <NavLink 
            to="/profile/wallet" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <FaWallet />
            <span>Wallet</span>
          </NavLink>
          
          <NavLink 
            to="/profile/my-bookings" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <FaBriefcase />
            <span>My Bookings</span>
          </NavLink>
          
          <NavLink 
            to="/profile/wishlist" 
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
          >
            <FaHeart />
            <span>Wishlist</span>
          </NavLink>
        </nav>

        <div className={styles.contentArea}>
          <Outlet /> 
        </div>

      </div>
    </div>
  );
}

export default Profile;