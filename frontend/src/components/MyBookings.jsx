import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/MyBookings.module.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if(!window.confirm("Are you sure you want to cancel this trip? Funds will be returned to your wallet.")) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        await axios.patch(`${API_URL}/api/bookings/${bookingId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        alert("Booking cancelled successfully.");
        fetchBookings(); 
    } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return styles.pending;
      case 'confirmed': return styles.confirmed;
      case 'rejected':
      case 'cancelled': return styles.rejected;
      case 'completed': return styles.completed;
      default: return styles.default;
    }
  };

  const getImageUrl = (offer) => {
    if (!offer) return 'https://via.placeholder.com/300x200?text=Offer+Deleted';
    if (offer.imageUrls && offer.imageUrls.length > 0) {
      return offer.imageUrls[0].startsWith('http') ? offer.imageUrls[0] : `${API_URL}${offer.imageUrls[0]}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  if (loading) return <div className={styles.loadingState}>Loading...</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You have no bookings yet.</p>
          <Link to="/trips" className={styles.findTripButton}>Find a Trip</Link>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map(booking => {
            const isCancellable = 
                (booking.status === 'pending' || booking.status === 'confirmed') && 
                new Date(booking.selectedDate) > new Date();

            return (
                <div key={booking._id} className={styles.bookingCard}>
                <div className={styles.imageWrapper}>
                    <img 
                        src={getImageUrl(booking.offer)} 
                        alt={booking.offer?.title} 
                        className={styles.bookingImage} 
                    />
                </div>
                
                <div className={styles.bookingDetails}>
                    {booking.offer ? (
                        <>
                            <h2 className={styles.offerTitle}>{booking.offer.title}</h2>
                            <p className={styles.location}>{booking.offer.city}, {booking.offer.country}</p>
                        </>
                    ) : (
                        <h2 className={styles.offerTitleDeleted}>Offer unavailable</h2>
                    )}

                    <div className={styles.infoGrid}>
                        <p><strong>Date:</strong> {new Date(booking.selectedDate).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> {booking.amount?.toFixed(2)} PLN</p>
                    </div>

                    {isCancellable && (
                        <button 
                            className={styles.cancelButton}
                            onClick={() => handleCancelBooking(booking._id)}
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>

                <div className={styles.bookingStatusWrapper}>
                    <span className={styles.statusLabel}>Status</span>
                    <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                    {booking.status}
                    </span>
                </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;