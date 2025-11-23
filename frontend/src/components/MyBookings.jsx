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
        // Запит на отримання бронювань юзера
        const res = await axios.get(`${API_URL}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Оновлена логіка класів відповідно до бекенду
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.pending;   // Жовтий
      case 'confirmed':
        return styles.confirmed; // Зелений
      case 'rejected':
      case 'cancelled':
        return styles.rejected;  // Червоний
      case 'completed':
        return styles.completed; // Сірий/Синій
      default:
        return styles.default;
    }
  };
  
  // Безпечне отримання картинки
  const getImageUrl = (offer) => {
    if (!offer) return 'https://via.placeholder.com/300x200?text=Offer+Deleted';
    
    if (offer.imageUrls && offer.imageUrls.length > 0) {
      const firstImage = offer.imageUrls[0];
      if (firstImage.startsWith('http')) {
        return firstImage;
      }
      return `${API_URL}${firstImage}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  if (loading) return <div className={styles.loadingState}>Loading your bookings...</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

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
              {/* Перевірка, чи існує offer (тур міг бути видалений) */}
              <div className={styles.imageWrapper}>
                 <img 
                    src={getImageUrl(booking.offer)} 
                    alt={booking.offer?.title || 'Unknown Offer'} 
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
                    <h2 className={styles.offerTitleDeleted}>Offer no longer available</h2>
                )}

                <div className={styles.infoGrid}>
                    <p><strong>Date:</strong> {new Date(booking.selectedDate).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> {booking.amount?.toFixed(2)} PLN</p>
                    <p><strong>Travelers:</strong> {booking.travelers?.adults || 1} Adults
                    {booking.travelers?.children?.length > 0 && `, ${booking.travelers.children.length} Kids`}
                    </p>
                </div>
              </div>

              <div className={styles.bookingStatusWrapper}>
                <span className={styles.statusLabel}>Status</span>
                <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                  {booking.status.toUpperCase()}
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