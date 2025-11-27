import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/MyBookings.module.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const MyRents = () => {
  const [rents, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/cars/my-rents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching rents:", err);
      setError('Failed to load rents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (rentId) => {
    if(!window.confirm("Are you sure you want to cancel this rent? Funds will be returned to your wallet.")) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        await axios.patch(`${API_URL}/api/cars/${rentId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        alert("Booking cancelled successfully.");
        fetchBookings(); 
    } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel rent");
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

  const getImageUrl = (car) => {
    if (!car) return 'https://via.placeholder.com/300x200?text=Offer+Deleted';
    if (car.imageUrl) {
      return car.imageUrl.startsWith('http') ? car.imageUrl : `${API_URL}${car.imageUrl}`;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  if (loading) return <div className={styles.loadingState}>Loading...</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Rents</h1>
      
      {rents.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You have no rents yet.</p>
          <Link to="/rent-car" className={styles.findTripButton}>Rent Car</Link>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {rents.map(rent => {
            const isCancellable = 
                (rent.status === 'pending' || rent.status === 'confirmed') && 
                new Date(rent.selectedDate) > new Date();

            return (
                <div key={rent._id} className={styles.bookingCard}>
                <div className={styles.imageWrapper}>
                    <img 
                        src={getImageUrl(rent.car)} 
                        alt={rent.car?.model} 
                        className={styles.bookingImage} 
                    />
                </div>
                
                <div className={styles.bookingDetails}>
                    {rent.car ? (
                        <>
                            <h2 className={styles.offerTitle}>{rent.car.model}</h2>
                            <p className={styles.location}>{rent.car.city}, {rent.car.country}</p>
                        </>
                    ) : (
                        <h2 className={styles.offerTitleDeleted}>Rent unavailable</h2>
                    )}

                    <div className={styles.infoGrid}>
                        <p><strong>Pickup Date:</strong> {new Date(rent.pickupDate).toLocaleDateString()}</p>
                        <p><strong>Return Date:</strong> {new Date(rent.returnDate).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> {rent.totalPrice?.toFixed(2)} PLN</p>
                    </div>

                    {isCancellable && (
                        <button 
                            className={styles.cancelButton}
                            onClick={() => handleCancelBooking(rent._id)}
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>

                <div className={styles.bookingStatusWrapper}>
                    <span className={styles.statusLabel}>Status</span>
                    <span className={`${styles.statusBadge} ${getStatusClass(rent.status)}`}>
                    {rent.status}
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

export default MyRents;