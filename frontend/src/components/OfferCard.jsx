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

  const buildImageUrl = (filename) => {
  if (!filename || filename === "") return null;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  if (filename.startsWith('http')) return filename;
  return `${apiUrl}${filename.startsWith('/') ? '' : '/'}${filename}`;
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
      
{offer.imageUrls && offer.imageUrls.length > 0 && buildImageUrl(offer.imageUrls[0]) ? (
  <img
    src={buildImageUrl(offer.imageUrls[0])}
    alt={offer.title || "Offer"}
    className="offer-image" 
    onError={(e) => {
      console.warn("Image load failed:", e.target.src); 
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';  // Fallback
    }}
  />
) : (
  <div className="no-image-placeholder" style={{ width: '100%', height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    No Image
  </div>
)}      <div className="offer-content">
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