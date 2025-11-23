import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from '../assets/styles/Modals.module.css';

const BookingModal = ({
  offer,
  userData, // Поточний юзер (якщо booking for self)
  handleBookingSubmit,
  closeModal,
}) => {
  // --- States ---
  const [selectedDate, setSelectedDate] = useState("");
  // Використовуємо ту саму структуру, що і в TripDetails
  const [travelers, setTravelers] = useState({
    adults: 1,
    children: [], // Array of objects { birthDate: "YYYY-MM-DD" }
  });
  const [errors, setErrors] = useState([]);

  // --- Helpers ---
  const formatDateRange = (dateStr, duration) => {
    if (!dateStr) return "";
    const startDate = new Date(dateStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (duration ? duration - 1 : 0));

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return `${startDate.toLocaleDateString('uk-UA', options)} - ${endDate.toLocaleDateString('uk-UA', options)} (${duration} days)`;
  };

  const calculateAge = (birthDate, referenceDate) => {
    const refDate = referenceDate ? new Date(referenceDate) : new Date();
    const birth = new Date(birthDate);
    let age = refDate.getFullYear() - birth.getFullYear();
    const monthDiff = refDate.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateBirthDate = (birthDate, index) => {
    if (!birthDate) return "Please select a birth date.";
    const referenceDate = selectedDate ? new Date(selectedDate) : new Date();
    // Приклад валідації (можна змінити правила)
    if (birthDate > new Date().toISOString().split('T')[0]) {
      return "Birth date cannot be in the future.";
    }
    return "";
  };

  // --- Handlers ---
  const handleTravelerChange = (type, delta) => {
    setTravelers((prev) => {
      if (type === "adults") {
        const newAdults = Math.max(1, prev.adults + delta);
        return { ...prev, adults: newAdults };
      } else if (type === "children") {
        const newCount = Math.max(0, prev.children.length + delta);
        const newChildren = prev.children.slice(0, newCount);
        
        // Якщо додали дитину, додаємо порожній об'єкт
        if (delta > 0 && newCount > prev.children.length) {
          newChildren.push({ birthDate: "" });
        }
        
        // Оновлюємо помилки
        const newErrors = newChildren.map((child, i) => validateBirthDate(child.birthDate, i));
        setErrors(newErrors);

        return { ...prev, children: newChildren };
      }
      return prev;
    });
  };

  const handleChildBirthDateChange = (index, birthDate) => {
    setTravelers((prev) => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], birthDate };
      return { ...prev, children: newChildren };
    });
    setErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = validateBirthDate(birthDate, index);
      return newErrors;
    });
  };

  // --- Price Calculation (Logic from TripDetails) ---
  const totalPrice = (() => {
    if (!offer?.price) return 0;
    let total = travelers.adults * offer.price;

    travelers.children.forEach((child) => {
      if (!child.birthDate) {
        // Якщо дата не вибрана, рахуємо як повну або 0 (тут логіка на ваш розсуд, 
        // поки беремо 0, але валідація не пропустить сабміт)
        return; 
      }
      const age = calculateAge(child.birthDate, selectedDate);
      if (age <= 2) total += offer.price * 0.1;      // Infant
      else if (age <= 11) total += offer.price * 0.6; // Child
      else total += offer.price;                      // Teen/Adult price
    });
    return total;
  })();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate) {
      alert("Please select a booking date.");
      return;
    }

    const hasErrors = errors.some((err) => err !== "") || 
                      travelers.children.some(c => !c.birthDate);
    
    if (hasErrors) {
      alert("Please fill in all children's birth dates correctly.");
      return;
    }

    const bookingPayload = {
      offerId: offer._id,
      amount: parseFloat(totalPrice.toFixed(2)),
      selectedDate: selectedDate,
      travelers: travelers, // Відправляємо структуру {adults, children}
    };

    handleBookingSubmit(bookingPayload);
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
            
            {/* 1. Date Selection */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>
                Select Date:
              </label>
              <select
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              >
                <option value="" disabled>-- Choose a date --</option>
                {offer?.availableDates?.length > 0 ? (
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

            {/* 2. Travelers Selection (Matching TripDetails Logic) */}
            <div className="travelers-section" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Travelers</h4>
              
              {/* Adults */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <label>Adults (12+):</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button type="button" 
                    onClick={() => handleTravelerChange("adults", -1)} 
                    disabled={travelers.adults <= 1}
                    style={{ width: '30px', height: '30px', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{travelers.adults}</span>
                  <button type="button" 
                    onClick={() => handleTravelerChange("adults", 1)}
                    style={{ width: '30px', height: '30px', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Children */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label>Children (0-11):</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button type="button" 
                    onClick={() => handleTravelerChange("children", -1)}
                    disabled={travelers.children.length === 0}
                    style={{ width: '30px', height: '30px', cursor: 'pointer' }}>-</button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{travelers.children.length}</span>
                  <button type="button" 
                    onClick={() => handleTravelerChange("children", 1)}
                    style={{ width: '30px', height: '30px', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Children Birth Dates */}
              {travelers.children.map((child, index) => (
                <div key={index} style={{ marginTop: '10px', paddingLeft: '10px', borderLeft: '3px solid #ddd' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>
                    Child {index + 1} Birth Date:
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={child.birthDate}
                    onChange={(e) => handleChildBirthDateChange(index, e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    required
                    style={{ width: '100%', padding: '8px' }}
                  />
                  {child.birthDate && selectedDate && (
                    <small style={{ color: '#666' }}>
                      Age at trip: {calculateAge(child.birthDate, selectedDate)} years
                    </small>
                  )}
                  {errors[index] && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors[index]}</div>}
                </div>
              ))}
            </div>

          </form>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.modalPrice}>
            Total: <strong>{totalPrice.toFixed(2)} PLN</strong>
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
  handleBookingSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default BookingModal;