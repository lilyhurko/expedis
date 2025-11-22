import React, { useState } from 'react';
import PropTypes from 'prop-types';
// DatePicker більше не потрібен, використовуємо select
import styles from '../assets/styles/Modals.module.css';

const BookingModal = ({
  offer,
  userData,
  isForSelf,
  setIsForSelf,
  numGuests,
  setNumGuests,
  guestData,
  setGuestData,
  handleGuestChange,
  handleBookingSubmit,
  closeModal,
}) => {
  const [selectedDate, setSelectedDate] = useState("");

  const totalPrice = offer?.price ? offer.price * (isForSelf ? 1 : numGuests) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isForSelf && numGuests < 1) {
      alert("Number of guests must be at least 1.");
      return;
    }
    if (!isForSelf && guestData.some((guest) => !guest.name.trim() || !guest.surname.trim())) {
      alert("All guest names and surnames are required.");
      return;
    }
    if (!selectedDate) {
      alert("Please select a booking date.");
      return;
    }

    const bookingPayload = {
      offerId: offer._id,
      amount: totalPrice,
      selectedDate: selectedDate,
      travelers: isForSelf
        ? [{ name: userData.name, surname: userData.surname }]
        : guestData,
    };

    handleBookingSubmit(bookingPayload);
  };

  // Форматування дати для відображення у списку (DD.MM.YYYY - DD.MM.YYYY)
  const formatDateRange = (dateStr, duration) => {
    if (!dateStr) return "";
    const startDate = new Date(dateStr);
    const endDate = new Date(startDate);
    // Додаємо тривалість туру
    endDate.setDate(startDate.getDate() + (duration ? duration - 1 : 0));

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const start = startDate.toLocaleDateString('uk-UA', options);
    const end = endDate.toLocaleDateString('uk-UA', options);
    
    return `${start} - ${end} (${duration} days)`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            Booking: {offer?.title || 'Selected Offer'}
          </h3>
          <button className={styles.modalClose} onClick={closeModal}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          <form id="booking-form" onSubmit={handleSubmit}>
            
            <div className="form-group">
              <div className="radio-group" style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <label className="form-label" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="bookingFor"
                    value="self"
                    checked={isForSelf}
                    onChange={() => setIsForSelf(true)}
                    style={{ marginRight: '8px' }}
                  />
                  Booking for myself
                </label>
                <label className="form-label" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="bookingFor"
                    value="others"
                    checked={!isForSelf}
                    onChange={() => setIsForSelf(false)}
                    style={{ marginRight: '8px' }}
                  />
                  Booking for someone else
                </label>
              </div>
            </div>

            {isForSelf ? (
              <>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Name:</label>
                  <input type="text" className="form-input" value={userData.name || ''} readOnly />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Email:</label>
                  <input type="email" className="form-input" value={userData.email || ''} readOnly />
                </div>
              </>
            ) : (
              <>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Number of Guests:</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={numGuests}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10) || 1;
                      setNumGuests(value);
                      setGuestData(Array(value).fill({ name: '', surname: '' }));
                    }}
                    required
                  />
                </div>
                {guestData.map((guest, index) => (
                  <div key={index} className="guest-group" style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                    <h4 className="form-label" style={{ margin: '0 0 10px 0' }}>Guest {index + 1}</h4>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="First Name"
                        value={guest.name}
                        onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Last Name"
                        value={guest.surname}
                        onChange={(e) => handleGuestChange(index, 'surname', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Select Booking Date:
              </label>
              
              {/* ВИПАДАЮЧИЙ СПИСОК ДАТ */}
              <select
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                style={{ 
                  width: "100%", 
                  height: "45px", 
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  padding: "0 15px",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  cursor: "pointer",
                  appearance: "none", /* Прибирає стандартну стрілку браузера (для чистоти стилю) */
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 8.825L1.175 4 2.238 2.938 6 6.7l3.763-3.763L10.825 4z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 15px center"
                }}
              >
                <option value="" disabled>-- Choose a date --</option>
                {offer?.availableDates && offer.availableDates.length > 0 ? (
                  offer.availableDates.map((date, index) => (
                    <option key={index} value={date}>
                      {formatDateRange(date, offer.duration)}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No available dates</option>
                )}
              </select>
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.modalPrice}>
            Total: {totalPrice.toFixed(2)} PLN
          </div>
          <div className={styles.buttonsGroup}>
            <button 
              type="button" 
              className={styles.btnSecondary} 
              onClick={closeModal}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="booking-form" 
              className={styles.btnPrimary}
            >
              Confirm & Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  offer: PropTypes.object,
  userData: PropTypes.object,
  isForSelf: PropTypes.bool,
  setIsForSelf: PropTypes.func,
  numGuests: PropTypes.number,
  setNumGuests: PropTypes.func,
  guestData: PropTypes.array,
  setGuestData: PropTypes.func,
  handleGuestChange: PropTypes.func,
  handleBookingSubmit: PropTypes.func,
  closeModal: PropTypes.func,
};

export default BookingModal;