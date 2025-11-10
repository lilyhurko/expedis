import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import styles from '../assets/styles/OfferCard.module.css';

const OfferCard = ({ offer, userRole, handleBookNow, handleEditOffer, handleDeleteOffer }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/offer/${offer._id}`);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  const buildImageUrl = (filename) => {
    if (!filename || filename === "") return null;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    if (filename.startsWith('http')) return filename;
    return `${apiUrl}${filename.startsWith('/') ? '' : '/'}${filename}`;
  };

  return (
    <div className={styles.offerCard} key={offer._id} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {userRole === 'admin' && (
        <div className={styles.adminActions}>
          <button 
            className={styles.editIconButton} 
            onClick={(e) => handleActionClick(e, () => handleEditOffer(offer._id))}
            aria-label="Edit offer"
          >
            <FaEdit className={styles.editIcon} />
          </button>
          <button 
            className={styles.deleteIconButton} 
            onClick={(e) => handleActionClick(e, () => handleDeleteOffer(offer._id))}
            aria-label="Delete offer"
          >
            <FaTrash className={styles.deleteIcon} />
          </button>
        </div>
      )}
      
      <div className={styles.imageWrapper}>
        {offer.imageUrls && offer.imageUrls.length > 0 && buildImageUrl(offer.imageUrls[0]) ? (
          <img
            src={buildImageUrl(offer.imageUrls[0])}
            alt={offer.title || "Offer"}
            className={styles.offerImage} 
            onError={(e) => {
              console.warn("Image load failed:", e.target.src); 
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        ) : (
          <div className={styles.noImagePlaceholder}>
            No Image
          </div>
        )}
      </div>

      <div className={styles.offerContent}>
        <p className={styles.offerLocation}>
          <span className={styles.locationIcon}></span>
          {offer.city}, {offer.country || 'United State of America'}
        </p>

        <h3 className={styles.offerTitle}>{offer.title}</h3>
        
        <div className={styles.offerFooter}>
          <span className={styles.offerPrice}>{offer.price || 0} PLN</span>
          <div className={styles.offerActions}>
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