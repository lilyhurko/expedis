import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/Profile.css';
import  ForcedLogout from './ForcedLogout.js';

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
    if (window.confirm('Are you sure you want to delete your profile? ')) {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center' }}>My Profile</h2>
      <p><strong>First Name:</strong> {user.name}</p>
      <p><strong>Last Name:</strong> {user.surname}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <div className="button-wrapper">
        <button className="form-button" style={{ marginRight: '10px' }} onClick={handleEditOpen}>
          Edit
        </button>
        <button className="form-button" onClick={handleDelete}>
          Delete Profile
        </button>
        
      </div>

      {/* Modal */}
      {isModalOpen && (
  <div className="modal-overlay">
    <div className="modal-profile">
      <div className="modal-header">
        <h3 className="modal-title">Edit Profile</h3>
        <button className="modal-close" onClick={handleEditClose} aria-label="Close modal">&times;</button>
      </div>
      
      <div className="modal-content">
        <input
          className="form-input"
          name="name"
          value={tempUser.name}
          onChange={handleChange}
          placeholder="First Name"
        />
        <input
          className="form-input"
          name="surname"
          value={tempUser.surname}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <input
          className="form-input"
          name="email"
          value={tempUser.email}
          onChange={handleChange}
          placeholder="Email"
        />
      </div>
      
      <div className="modal-footer">
        <button className="form-button" onClick={handleEditClose}>
          Cancel
        </button>
        <button className="form-button primary" onClick={handleUpdate}>
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Profile;