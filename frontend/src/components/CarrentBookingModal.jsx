import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ForcedLogout from './ForcedLogout'; 


const CarrentBookingModal = ({ car, userData, searchDates, closeModal }) => {
    
    const { pickupDate, returnDate } = searchDates;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; 
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const totalPrice = car.pricePerDay * diffDays;

    const handleConfirmBooking = async () => {
        setBookingLoading(true);
        setBookingError(null);
        const token = localStorage.getItem("token");

        if (!token) {
            ForcedLogout();
            return;
        }

        if (userData.balance < totalPrice) {
            setBookingError(`Insufficient funds. Your balance: ${userData.balance.toFixed(2)} PLN, required: ${totalPrice.toFixed(2)} PLN.`);
            setBookingLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/cars/book`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    carId: car._id,
                    pickupDate: pickupDate,
                    returnDate: returnDate,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Server booking error.');
            }

            alert(`Booking of ${car.make} successful! ${totalPrice.toFixed(2)} PLN debited. Awaiting administrator confirmation.`);
            
            closeModal();
            
        } catch (error) {
            console.error("Booking error:", error);
            setBookingError(error.message);
        } finally {
            setBookingLoading(false);
        }
    };

    if (diffDays <= 0 || isNaN(totalPrice) || !pickupDate || !returnDate) {
        return (
            <div className="modal-overlay">
                <div className="modal modal-booking">
                    <div className="modal-header">
                        <h3 className="modal-title">Error</h3>
                        <button className="modal-close" onClick={closeModal}>×</button>
                    </div>
                    <div className="modal-body">
                        <p>Invalid date range selected. Please ensure you select two valid dates.</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="modal-overlay"> 
            <div className="modal modal-booking"> 
                <div className="modal-header">
                    <h3 className="modal-title">Confirm Rental: {car.make} {car.model}</h3> 
                    <button className="modal-close" onClick={closeModal}>×</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Rental Summary:</label>
                        <div className="booking-details-summary" style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                            <p><strong>City:</strong> {car.city}</p>
                            <p><strong>Period:</strong> {pickupDate} to {returnDate}</p>
                            <p><strong>Duration:</strong> {diffDays} days</p>
                            <p><strong>Daily Rate:</strong> {car.pricePerDay.toFixed(2)} PLN</p>
                            <hr style={{ margin: '10px 0' }}/>
                            <p><strong>Your Current Balance:</strong> {userData.balance ? userData.balance.toFixed(2) : '---'} PLN</p>
                        </div>
                    </div>
                    
                    {bookingError && <p style={{ color: 'red', margin: '15px 0' }}>{bookingError}</p>}
                </div>
                
                <div className="modal-footer"> 
                    <div className="total-price" style={{ marginRight: 'auto', fontWeight: 'bold', fontSize: '1.1em', paddingTop: '8px' }}>
                        Total Price: {totalPrice.toFixed(2)} PLN
                    </div>

                    <div className="buttons-group">
                        <button 
                            className="btn btn-secondary" 
                            onClick={closeModal}
                            disabled={bookingLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading || userData.balance < totalPrice}
                        >
                            {bookingLoading ? 'Processing...' : 'Confirm & Pay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

CarrentBookingModal.propTypes = {
    car: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    searchDates: PropTypes.shape({
        pickupDate: PropTypes.string,
        returnDate: PropTypes.string,
    }).isRequired,
    closeModal: PropTypes.func.isRequired,
};

export default CarrentBookingModal;