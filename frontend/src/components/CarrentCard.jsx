import React from 'react';
import { FaCar, FaCity, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';

const buildImageUrl = (filename) => {
    if (!filename || filename === "") return null;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    if (filename.startsWith('http')) return filename;
    return `${apiUrl}${filename.startsWith('/') ? '' : '/'}${filename}`;
};

const CarrentCard = ({ 
    car, 
    userRole, 
    handleBookNow, 
    handleEditCar,
    handleDeleteCar,
    searchDates 
}) => {
    
    let totalPriceDisplay = null;
    let diffDays = 0;
    if (searchDates.pickupDate && searchDates.returnDate) {
        const start = new Date(searchDates.pickupDate);
        const end = new Date(searchDates.returnDate);
        const diffTime = Math.abs(end - start);
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const totalPrice = car.pricePerDay * diffDays;
        
        if (diffDays > 0) {
            totalPriceDisplay = `${totalPrice.toFixed(2)} PLN (for ${diffDays} days)`;
        }
    }
    
    const handleActionClick = (e, action) => {
        e.stopPropagation(); 
        action();
    };

    const carImage = buildImageUrl(car.imageUrl);
    
    return (
        <div className="offer-card" key={car._id} style={{ cursor: 'pointer' }}>
            
            {userRole === 'admin' && (
                <div className="admin-actions">
                    <button 
                        className="edit-icon-button" 
                        onClick={(e) => handleActionClick(e, () => handleEditCar(car._id))}
                        aria-label="Edit car"
                    >
                        <FaEdit className="edit-icon" /> 
                    </button>
                    <button 
                        className="delete-icon-button" 
                        onClick={(e) => handleActionClick(e, () => handleDeleteCar(car._id))}
                        aria-label="Delete car"
                    >
                        <FaTrash className="delete-icon" /> 
                    </button>
                </div>
            )}

            {carImage ? (
                <img
                    src={carImage}
                    alt={`${car.make} ${car.model}`}
                    className="offer-image" 
                    onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0PSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjY2MiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FyIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; }}
                />
            ) : (
                <div className="no-image-placeholder" style={{ width: '100%', height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No Car Image
                </div>
            )}
            
            <div className="offer-content">
                <h3 className="offer-title">{car.make} {car.model} ({car.year})</h3>
                <p className="offer-description">{car.description || 'Reliable vehicle for your journey.'}</p>
                
                <p className="offer-city"><FaCity /> <strong>City:</strong> {car.city}, {car.country}</p>
                <p className="offer-duration"><FaCar /> <strong>Per Day:</strong> {car.pricePerDay.toFixed(2)} PLN</p>
                {diffDays > 0 && (
                     <p className="offer-duration"><FaCalendarAlt /> <strong>Days:</strong> {diffDays}</p>
                )}
                
                <div className="offer-footer">
                    <span className="offer-price">
                        {totalPriceDisplay || `${car.pricePerDay.toFixed(2)} PLN / day`}
                    </span>
                    
                    <div className="offer-actions">
                        {userRole !== 'admin' && (
                            <button 
                                className="book-now-button navbar-login-button" 
                                onClick={(e) => handleActionClick(e, () => handleBookNow(car._id))}
                                disabled={diffDays === 0}
                            >
                                {diffDays > 0 ? 'Book Now' : 'Select Dates'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarrentCard;