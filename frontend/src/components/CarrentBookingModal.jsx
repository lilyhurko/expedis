import React, { useState } from 'react';
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


    return (
        <div className="modal-backdrop"> 
            <div className="modal-content"> 
                <h3 className="offer-title">Confirm Rental: {car.make} {car.model}</h3> 
                
                <div className="offer-content" style={{ padding: '15px 0' }}> 
                    <p><strong>City:</strong> {car.city}</p>
                    <p><strong>Rental Dates:</strong> {pickupDate} to {returnDate} ({diffDays} days)</p>
                    <p><strong>Price per day:</strong> {car.pricePerDay.toFixed(2)} PLN</p>
                    <hr style={{ margin: '10px 0' }}/>
                    <p><strong>Total Cost:</strong> <span className="offer-price">{totalPrice.toFixed(2)} PLN</span></p> 
                    <p><strong>Your Current Balance:</strong> {userData.balance ? userData.balance.toFixed(2) : '---'} PLN</p>
                </div>

                {bookingError && <p style={{ color: 'red', marginTop: '10px' }}>{bookingError}</p>}
                
                <div className="offer-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}> 
                    <button 
                        className="book-now-button navbar-login-button" 
                        onClick={handleConfirmBooking}
                        disabled={bookingLoading || userData.balance < totalPrice}
                    >
                        {bookingLoading ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                    <button 
                        className="delete-icon-button" 
                        onClick={closeModal}
                        disabled={bookingLoading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarrentBookingModal;