import React, { useEffect, useState, useRef } from 'react'; // <--- ВИПРАВЛЕННЯ 1
import axios from 'axios';
import styles from '../assets/styles/Profile.module.css';
import ForcedLogout from './ForcedLogout.js';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Profile() {
  const [user, setUser] = useState({
    name: '',
    surname: '',
    email: '',
    avatar: ''
  });
  
  const [wallet, setWallet] = useState({
    balance: 0,
    balance_held: 0
  });
  const [topUpAmount, setTopUpAmount] = useState(''); 
  const [topUpMessage, setTopUpMessage] = useState(''); 

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [tempUser, setTempUser] = useState({ ...user });

  const fileInputRef = useRef(null); 
  const [avatarUploadMessage, setAvatarUploadMessage] = useState('');

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    let isMounted = true; 
    setLoading(true);

    const fetchUserData = () => {
      axios.get(`${API_URL}/api/users/me`, authHeaders)
        .then(res => {
          if (isMounted) {
            setUser(res.data);
            setTempUser(res.data);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error('Error fetching user data:', err);
            ForcedLogout();
          }
        });
    };
    
    const fetchWalletData = () => {
      axios.get(`${API_URL}/api/wallet/me`, authHeaders)
        .then(res => {
          if (isMounted) {
            setWallet(res.data);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error('Error fetching wallet:', err);
          }
        });
    };

    fetchUserData();
    fetchWalletData();
    
    if (isMounted) {
        setLoading(false);
    }

    return () => {
      isMounted = false; 
    };
    
  }, []); 

  const handleEditOpen = () => {
    setTempUser(user);
    setIsModalOpen(true); 
  };

  const handleEditClose = () => {
    setIsModalOpen(false); 
  };

  const handleChange = (e) => {
    setTempUser({ ...tempUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    axios.put(`${API_URL}/api/users/me`, tempUser, authHeaders)
      .then(res => {
        setUser(prevUser => ({ ...prevUser, ...res.data }));
        alert('Profile updated!');
        setIsModalOpen(false); 
      })
      .catch(err => {
        alert('Error while updating!');
        ForcedLogout();
      });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      axios.delete(`${API_URL}/api/users/me`, authHeaders)
        .then(() => {
          alert('Profile deleted!');
          ForcedLogout();
        })
        .catch(err => {
          alert('Error while deleting!');
          ForcedLogout();
        });
    }
  };

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
        console.error(err);
        setTopUpMessage(err.response?.data?.message || 'An error occurred. Please try again.');
      });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAvatarUploadMessage('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file); 

    try {
      const res = await axios.post(`${API_URL}/api/users/me/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setUser(prevUser => ({ ...prevUser, avatar: res.data.avatar }));
      setAvatarUploadMessage('Avatar uploaded successfully!');
    } catch (err) {
      console.error('Error uploading avatar:', err.response?.data?.message || err.message);
      setAvatarUploadMessage(err.response?.data?.message || 'Failed to upload avatar.');
    }
  };


  if (loading) return <div className={styles.loading}>Loading...</div>;

  const defaultAvatar = 'https://via.placeholder.com/150?text=No+Avatar';

  return (
    <div className={styles.profilePageContainer}>
      <h2 className={styles.pageTitle}>My Profile</h2>

      <div className={styles.profileLayout}>

        <section className={styles.profileSection}>
          <h3 className={styles.sectionTitle}>Profile Details</h3>
          
          <div className={styles.avatarContainer}>
            <img 
              src={user.avatar ? `${API_URL}${user.avatar}` : defaultAvatar} 
              alt="User Avatar" 
              className={styles.avatar} 
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleAvatarChange} 
              accept="image/*"
            />
            <button className={styles.changeAvatarButton} onClick={() => fileInputRef.current.click()}>
              Change Avatar
            </button>
            {avatarUploadMessage && (
              <p className={styles.avatarMessage} style={{ color: avatarUploadMessage.includes('successfully') ? 'green' : 'red' }}>
                {avatarUploadMessage}
              </p>
            )}
          </div>

          <p className={styles.profileDetail}><strong style={{ color: '#1B3A4B' }}>First Name:</strong> {user.name}</p>
          <p className={styles.profileDetail}><strong style={{ color: '#1B3A4B' }}>Last Name:</strong> {user.surname}</p>
          <p className={styles.profileDetail}><strong style={{ color: '#1B3A4B' }}>Email:</strong> {user.email}</p>

          <div className={styles.buttonWrapper}>
            <button className={`${styles.formButton} ${styles.primary}`} style={{ marginRight: '10px' }} onClick={handleEditOpen}>
              Edit Profile
            </button>
            <button className={styles.formButton} onClick={handleDelete}>
              Delete Profile
            </button>
          </div>
        </section>

        <section className={styles.walletSection}>
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
              Submit a request, and our admin will top up your balance after receiving the bank transfer.
            </p>
            <input
              type="number"
              className={styles.formInput} 
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Amount in PLN (e.g., 1000)"
              min="1"
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

      </div> 

      {isModalOpen && (
        <div className={styles.profileModalWrapper}>
          <div className={styles.modalOverlay}>
            <div className={styles.modalProfile}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Edit Profile</h3>
                <button className={styles.modalClose} onClick={handleEditClose} aria-label="Close modal">×</button>
              </div>
              
              <div className={styles.modalContent}>
                <input
                  className={styles.formInput}
                  name="name"
                  value={tempUser.name}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                <input
                  className={styles.formInput}
                  name="surname"
                  value={tempUser.surname}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
                <input
                  className={styles.formInput}
                  name="email"
                  value={tempUser.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>
              
              <div className={styles.modalFooter}>
                <button className={styles.formButton} onClick={handleEditClose}>
                  Cancel
                </button>
                <button className={`${styles.formButton} ${styles.primary}`} onClick={handleUpdate}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Profile;