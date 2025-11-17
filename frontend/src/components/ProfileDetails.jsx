import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/styles/Profile.module.css';
import ForcedLogout from './ForcedLogout.js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const ProfileDetails = () => {
  const [user, setUser] = useState({ name: '', surname: '', email: '', avatar: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempUser, setTempUser] = useState({ name: '', surname: '', email: '' });
  const fileInputRef = useRef(null);
  const [avatarUploadMessage, setAvatarUploadMessage] = useState('');
  
  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${API_URL}/api/users/me`, authHeaders)
      .then(res => { 
        setUser(res.data); 
        setTempUser(res.data); 
      })
      .catch(err => {
        console.error(err);
        ForcedLogout();
      });
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await axios.post(`${API_URL}/api/users/me/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
      setAvatarUploadMessage('Avatar updated successfully!');
    } catch (err) { 
      setAvatarUploadMessage('Error uploading avatar'); 
    }
  };

  const handleUpdate = () => {
    axios.put(`${API_URL}/api/users/me`, tempUser, authHeaders)
      .then(res => { 
        setUser(prev => ({ ...prev, ...res.data })); 
        setIsModalOpen(false);
        alert('Profile updated!');
      })
      .catch(() => alert('Error updating profile'));
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      axios.delete(`${API_URL}/api/users/me`, authHeaders)
        .then(() => {
          alert('Profile deleted!');
          ForcedLogout();
        })
        .catch(() => alert('Error deleting user'));
    }
  };

  const defaultAvatar = 'https://via.placeholder.com/150?text=No+Avatar';

  return (
    <section>
      <h3 className={styles.sectionTitle}>Profile Details</h3>
      <div className={styles.avatarContainer}>
        <img src={user.avatar ? `${API_URL}${user.avatar}` : defaultAvatar} alt="Avatar" className={styles.avatar} />
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAvatarChange} accept="image/*" />
        <button className={styles.changeAvatarButton} onClick={() => fileInputRef.current.click()}>Change Avatar</button>
        {avatarUploadMessage && <p className={styles.avatarMessage}>{avatarUploadMessage}</p>}
      </div>

      <p className={styles.profileDetail}><strong>First Name:</strong> {user.name}</p>
      <p className={styles.profileDetail}><strong>Last Name:</strong> {user.surname}</p>
      <p className={styles.profileDetail}><strong>Email:</strong> {user.email}</p>
      
      <div className={styles.buttonWrapper}>
        <button className={`${styles.formButton} ${styles.primary}`} onClick={() => setIsModalOpen(true)}>Edit Profile</button>
        <button className={styles.formButton} onClick={handleDelete}>Delete Profile</button>
      </div>

      {isModalOpen && (
        <div className={styles.profileModalWrapper}>
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalProfile} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Edit Profile</h3>
                <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <div className={styles.modalContent}>
                <input className={styles.formInput} value={tempUser.name} onChange={e => setTempUser({...tempUser, name: e.target.value})} placeholder="First Name" />
                <input className={styles.formInput} value={tempUser.surname} onChange={e => setTempUser({...tempUser, surname: e.target.value})} placeholder="Last Name" style={{marginTop: '1rem'}}/>
                <input className={styles.formInput} value={tempUser.email} onChange={e => setTempUser({...tempUser, email: e.target.value})} placeholder="Email" style={{marginTop: '1rem'}}/>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.formButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className={`${styles.formButton} ${styles.primary}`} onClick={handleUpdate}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
export default ProfileDetails;