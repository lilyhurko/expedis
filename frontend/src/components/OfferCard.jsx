import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const OfferCard = ({ offer, userRole, handleBookNow, handleEditOffer, handleDeleteOffer }) => {
  const navigate = useNavigate();

const handleCardClick = () => {
  navigate(`/offer/${offer._id}`);
};


  const handleActionClick = (e, action) => {
    e.stopPropagation(); // Prevent card click from triggering
    action();
  };

  return (
    <div className="offer-card" key={offer._id} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {userRole === 'admin' && (
        <div className="admin-actions">
          <button 
            className="edit-icon-button" 
            onClick={(e) => handleActionClick(e, () => handleEditOffer(offer._id))}
            aria-label="Edit offer"
          >
            <FaEdit className="edit-icon" />
          </button>
          <button 
            className="delete-icon-button" 
            onClick={(e) => handleActionClick(e, () => handleDeleteOffer(offer._id))}
            aria-label="Delete offer"
          >
            <FaTrash className="delete-icon" />
          </button>
        </div>
      )}
      
      <img src={offer.imageUrl || ''} alt={offer.title} className="offer-image" />
      <div className="offer-content">
        <h3 className="offer-title">{offer.title}</h3>
        <p className="offer-description">{offer.description}</p>
        <p className="offer-city"><strong>City:</strong> {offer.city}</p>
        <p className="offer-duration"><strong>Duration:</strong> {offer.duration} days</p>
        <div className="offer-footer">
          <span className="offer-price">{offer.price || 0} PLN</span>
          <div className="offer-actions">
            {userRole !== 'admin' && (
              <button 
                className="book-now-button" 
                onClick={(e) => handleActionClick(e, () => handleBookNow(offer._id))}
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;