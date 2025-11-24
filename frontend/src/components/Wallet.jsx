import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/styles/Profile.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Wallet = () => {
  const [wallet, setWallet] = useState({ balance: 0, balance_held: 0 });
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpMessage, setTopUpMessage] = useState('');
  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${API_URL}/api/wallet/me`, authHeaders)
      .then(res => setWallet(res.data))
      .catch(err => console.error('Error fetching wallet:', err));
  }, []);

  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    setTopUpMessage('');
    const amount = parseFloat(topUpAmount);

    if (isNaN(amount) || amount <= 0) {
      setTopUpMessage('Please enter a valid amount.');
      return;
    }

    axios.post(`${API_URL}/api/wallet/top-up`, { amount }, authHeaders)
      .then(res => {
        setTopUpMessage(res.data.message);
        setTopUpAmount('');
      })
      .catch(err => {
        setTopUpMessage(err.response?.data?.message || 'An error occurred.');
      });
  };

  return (
    <section>
      <h3 className={styles.sectionTitle}>My Wallet</h3>
      
      <div className={styles.walletInfo}>
        <div className={styles.walletBalance}>
          <span>Available Balance:</span>
          <strong>{wallet.balance.toFixed(2)} PLN</strong>
        </div>
        <div className={styles.walletHeld}>
          <span>Funds on Hold:</span>
          <strong>{wallet.balance_held.toFixed(2)} PLN</strong>
        </div>
      </div>

      <form onSubmit={handleTopUpSubmit} className={styles.topUpForm}>
        <h4 className={styles.subSectionTitle}>Request Top-Up</h4>
        <p className={styles.topUpDescription}>
          Submit a request, and our admin will top up your balance.
        </p>
        <input
          type="number"
          className={styles.formInput} 
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(e.target.value)}
          placeholder="Amount in PLN (e.g., 1000)"
          min="0"
          step="100"
          style={{ marginBottom: '1rem', width: '100%', maxWidth: '400px' }}
        />
        <button type="submit" className={`${styles.formButton} ${styles.primary}`}>
          Request Top-Up
        </button>
        {topUpMessage && (
          <p className={styles.topUpMessage} style={{ color: topUpMessage.includes('error') ? 'red' : 'green' }}>
            {topUpMessage}
          </p>
        )}
      </form>
    </section>
  );
};

export default Wallet;