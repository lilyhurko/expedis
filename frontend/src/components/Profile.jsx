import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../assets/styles/Profile.module.css';
import ForcedLogout from './ForcedLogout.js';

function Profile() {
  const [user, setUser] = useState({
    name: '',
    surname: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });

  useEffect(() => {
    axios.get('/api/users/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setUser(res.data);
        setTempUser(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        ForcedLogout();
        setLoading(false);
      });
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
    axios.put('/api/users/me', tempUser, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setUser(tempUser);
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
      axios.delete('/api/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
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

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.formContainer}>
      <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', color: '#1B3A4B', fontSize: '2rem' }}>My Profile</h2>
      <p><strong style={{ color: '#1B3A4B' }}>First Name:</strong> {user.name}</p>
      <p><strong style={{ color: '#1B3A4B' }}>Last Name:</strong> {user.surname}</p>
      <p><strong style={{ color: '#1B3A4B' }}>Email:</strong> {user.email}</p>

      <div className={styles.buttonWrapper}>
        <button className={styles.formButton} style={{ marginRight: '10px' }} onClick={handleEditOpen}>
          Edit
        </button>
        <button className={styles.formButton} onClick={handleDelete}>
          Delete Profile
        </button>
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