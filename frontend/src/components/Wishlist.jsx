import React from 'react';
import styles from '../assets/styles/Profile.module.css';

const Wishlist = () => {
  return (
    <section>
      <h3 className={styles.sectionTitle}>My Wishlist</h3>
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#555' }}>
        <p style={{ fontSize: '1.2rem' }}>This feature is coming soon!</p>
        <p>Save your favorite trips here to view them later.</p>
      </div>
    </section>
  );
};

export default Wishlist;