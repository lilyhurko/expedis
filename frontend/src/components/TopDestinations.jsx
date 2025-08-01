import React, { useState, useEffect } from 'react';
import '../assets/styles/TopDestinations.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Placeholder for authentication state (replace with your auth logic)
const isAuthenticated = () => !!localStorage.getItem('token'); // Match Offerts logic

const TopDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
const fetchDestinations = async () => {
  try {
    const response = await axios.get('http://localhost:5001/api/offers');
        const fetchedDestinations = response.data.map((offer) => ({
          name: offer.title,
          tags: offer.categories,
          count: offer.categories.length.toString(),
          key: offer._id,
          image: offer.imageUrl.startsWith('http')
            ? offer.imageUrl
            : `${window.location.origin}${offer.imageUrl}`,
          description: offer.description,
          price: `from ${offer.price} PLN`,
          duration: `${offer.duration} days`,
        }));
        setDestinations(fetchedDestinations);
        setSelected(fetchedDestinations[0] || null);
     } catch (err) {
    console.error('Error fetching destinations:', err);
    setError('Failed to load destinations. Please try again later.');
  }
};

    fetchDestinations();
  }, []);

  const handleOpen = (dest) => {
    setSelected(dest);
    setShowModal(true);
  };

  const handleBookNow = (offerId) => {
    if (!isAuthenticated()) {
      localStorage.setItem('selectedOffer', offerId); // Match Offerts logic
      navigate('/login');
    } else {
      setSelected(destinations.find(o => o._id === offerId)); // Changed 'offers' to 'destinations'
      // You can add booking modal logic here or navigate to /offerts with offerId
      navigate(`/Trips?offer=${offerId}`); // Example redirect to Offerts page
    }
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="top-destinations container">
      <h2>Top Destinations of the Week</h2>
      <p className="description">
        Explore the most popular travel spots chosen by adventurers this week!
      </p>

      <div className="content">
        <div className="destination-list">
          {destinations.map((dest) => (
            <div
              key={dest.key}
              className={`city ${selected?.key === dest.key ? 'active' : ''}`}
              onClick={() => handleOpen(dest)}
            >
              <span>{dest.name}</span>
              <span className="tag">{dest.tags[0] || 'N/A'}</span>
              <span className="count">{dest.count}</span>
            </div>
          ))}
        </div>
        {selected && (
          <div className="destination-image">
            <img src={selected.image} alt={selected.name} />
          </div>
        )}
      </div>

      {showModal && selected && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">{selected.name}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="destination-modal-content">
                <p className="modal-description">{selected.description}</p>
                <div className="tags-container">
                  {selected.tags.map((tag, index) => (
                    <span key={index} className="custom-tag">{tag}</span>
                  ))}
                </div>
                <div className="duration-label">
                  Duration: {selected.duration}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="price-label">
                Price: {selected.price}
              </div>
              <button className="btn btn-primary" onClick={() => handleBookNow(selected.key)}>
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopDestinations;