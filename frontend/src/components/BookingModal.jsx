import React from 'react';

const BookingModal = ({
  offer,
  userData,
  isForSelf,
  setIsForSelf,
  numGuests,
  setNumGuests,
  guestData,
  setGuestData, // Added prop
  handleGuestChange,
  handleBookingSubmit,
  closeModal
}) => {
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
            onSubmit={handleBookingSubmit}  
          >
            <input type="hidden" name="_subject" value="New Booking Request" />
            <input type="hidden" name="_replyto" value={isForSelf ? userData.email : ''} />
            <input type="hidden" name="offerTitle" value={offer?.title || ''} />
            <input type="hidden" name="offerPrice" value={offer?.price || 0} />

            <div className="form-group">
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="bookingFor"
                    value="self"
                    checked={isForSelf}
                    onChange={() => setIsForSelf(true)}
                  />
                  Booking for myself
                </label>
                <label>
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
                  <input type="text" className="form-input" name="yourName" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Surname:</label>
                  <input type="text" className="form-input" name="yourSurname" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Email:</label>
                  <input type="email" className="form-input" name="email" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Guests:</label>
                  <input
                    type="number"
                    name="numGuests"
                    min="1"
                    value={numGuests}
                    onChange={e => {
                      const value = parseInt(e.target.value, 10) || 1;
                      setNumGuests(value);
                      setGuestData(Array(value).fill({ name: '', surname: '' }));
                    }}
                    required
                  />
                </div>

                {guestData.map((guest, index) => (
                  <div key={index} className="guest-group">
                    <h4>Guest {index + 1}</h4>
                    <div className="form-group">
                      <label className="form-label">Name:</label>
                      <input
                        type="text"
                        name={`guest_${index}_name`}
                        value={guest.name}
                        onChange={e => handleGuestChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Surname:</label>
                      <input
                        type="text"
                        name={`guest_${index}_surname`}
                        value={guest.surname}
                        onChange={e => handleGuestChange(index, 'surname', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            <div className="modal-footer">
              <div className="total-price" style={{ marginRight: 'auto', fontWeight: 'bold', fontSize: '1.1em', paddingTop: '8px' }}>
                Price: {offer?.price || 0} PLN
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

export default BookingModal;