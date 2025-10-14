import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-multi-date-picker';

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
  const [selectedDate, setSelectedDate] = useState(null);

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

    const formData = new FormData(e.target);
    formData.append("selectedDate", selectedDate);
    if (!isForSelf) {
      formData.append("guests", JSON.stringify(guestData));
    }
    handleBookingSubmit(formData);
  };

  const totalPrice = offer?.price ? offer.price * (isForSelf ? 1 : numGuests) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal modal-booking">
        <div className="modal-header">
          <h3 className="modal-title">
            Booking: {offer?.title || 'Selected Offer'}
          </h3>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-body">
          <form
            action="https://formspree.io/f/mjkwnbvl"
            method="POST"
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="_subject" value="New Booking Request" />
            <input type="hidden" name="_replyto" value={isForSelf ? userData.email : ''} />
            <input type="hidden" name="offerTitle" value={offer?.title || ''} />
            <input type="hidden" name="offerPrice" value={offer?.price || 0} />

            <div className="form-group">
              <div className="radio-group">
                <label className="form-label">
                  <input
                    type="radio"
                    name="bookingFor"
                    value="self"
                    checked={isForSelf}
                    onChange={() => setIsForSelf(true)}
                  />
                  Booking for myself
                </label>
                <label className="form-label">
                  <input
                    type="radio"
                    name="bookingFor"
                    value="others"
                    checked={!isForSelf}
                    onChange={() => setIsForSelf(false)}
                  />
                  Booking for someone else
                </label>
              </div>
            </div>

            {isForSelf ? (
              <>
                <div className="form-group">
                  <label className="form-label">Name:</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={`${userData.name || ''} ${userData.surname || ''}`}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    value={userData.email || ''}
                    readOnly
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Your Name:</label>
                  <input
                    type="text"
                    className="form-input"
                    name="yourName"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Surname:</label>
                  <input
                    type="text"
                    className="form-input"
                    name="yourSurname"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Email:</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Guests:</label>
                  <input
                    type="number"
                    className="form-input"
                    name="numGuests"
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
                  <div key={index} className="guest-group">
                    <h4 className="form-label">Guest {index + 1}</h4>
                    <div className="form-group">
                      <label className="form-label">Name:</label>
                      <input
                        type="text"
                        className="form-input"
                        name={`guest_${index}_name`}
                        value={guest.name}
                        onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Surname:</label>
                      <input
                        type="text"
                        className="form-input"
                        name={`guest_${index}_surname`}
                        value={guest.surname}
                        onChange={(e) => handleGuestChange(index, 'surname', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            <div className="form-group">
              <label className="form-label">Select Booking Date:</label>
              <div className="date-picker-container">
                <DatePicker
                  value={selectedDate}
                  onChange={(date) =>
                    setSelectedDate(date?.toDate ? date.toDate().toISOString().split('T')[0] : date)
                  }
                  format="YYYY-MM-DD"
                  placeholder="Select date"
                  className="form-input"
                  calendarPosition="bottom-left"
                  onlyShowInRangeDates
                  minDate={new Date()}
                  range={false}
                  mapDays={({ date }) => {
                    const dateStr = date.format('YYYY-MM-DD');
                    const isAvailable = offer?.availableDates?.includes(dateStr);
                    return {
                      disabled: !isAvailable,
                      style: isAvailable ? { color: '#000' } : { color: '#ccc' },
                    };
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <div
                className="total-price"
                style={{ marginRight: 'auto', fontWeight: 'bold', fontSize: '1.1em', paddingTop: '8px' }}
              >
                Total Price: {totalPrice} PLN {isForSelf ? '' : `(${numGuests} guest${numGuests > 1 ? 's' : ''})`}
              </div>
              <div className="buttons-group">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Booking
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  offer: PropTypes.shape({
    title: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    availableDates: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  userData: PropTypes.shape({
    name: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  isForSelf: PropTypes.bool.isRequired,
  setIsForSelf: PropTypes.func.isRequired,
  numGuests: PropTypes.number.isRequired,
  setNumGuests: PropTypes.func.isRequired,
  guestData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      surname: PropTypes.string,
    })
  ).isRequired,
  setGuestData: PropTypes.func.isRequired,
  handleGuestChange: PropTypes.func.isRequired,
  handleBookingSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default BookingModal;