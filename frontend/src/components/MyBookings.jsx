import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/MyBookings.module.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending_admin_confirmation':
        return styles.pending;
      case 'confirmed':
        return styles.confirmed;
      case 'rejected_by_admin':
      case 'cancelled_by_user':
        return styles.rejected;
      default:
        return '';
    }
  };
  
  const getImageUrl = (offer) => {
    if (offer.imageUrls && offer.imageUrls.length > 0) {
      const firstImage = offer.imageUrls[0];
      if (firstImage.startsWith('http')) {
        return firstImage;
      }
      return `${API_URL}${firstImage}`;
    }
    if (offer.imageUrl) {
        return `${API_URL}${offer.imageUrl}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image'; // Fallback
  };

  if (loading) return <div className={styles.container}>Loading your bookings...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Bookings</h1>
      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You have no bookings yet.</p>
          <Link to="/trips" className={styles.findTripButton}>
            Find a Trip
          </Link>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map(booking => (
            <div key={booking._id} className={styles.bookingCard}>
              <img 
                src={getImageUrl(booking.offer)} 
                alt={booking.offer.title} 
                className={styles.bookingImage} 
              />
              <div className={styles.bookingDetails}>
                <h2>{booking.offer.title}</h2>
                <p>{booking.offer.city}, {booking.offer.country}</p>
                <p><strong>Date:</strong> {new Date(booking.selectedDate).toLocaleDateString()}</p>
                <p><strong>Total Price:</strong> {booking.amount.toFixed(2)} PLN</p>
                <p><strong>Travelers:</strong> {booking.travelers.adults} Adults
                  {booking.travelers.children.length > 0 && `, ${booking.travelers.children.length} Children`}
                </p>
              </div>
              <div className={styles.bookingStatus}>
                <strong>Status:</strong>
                <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                  {booking.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;