import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

const RecommendedHotels = ({ city }) => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/hotels/search?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hotels (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        setHotels(data); 
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, [city, apiUrl]);

  if (isLoading) {
    return (
      <div className="recommended-hotels mb-8">
        <h2 className="section-heading">Recommended Stays in {city} </h2>
        <p>Loading hotels...</p>
      </div>
    );
  }

  if (error || hotels.length === 0) {
    return null; 
  }

  return (
    <div className="recommended-hotels mb-8">
      <h2 className="section-heading">Recommended Stays in {city} </h2>
      <div className="hotels-grid">
        {hotels.map((hotel, index) => {
          
          // Конвертуємо наш "імітований" рейтинг 1-10 (9.0 або 7.0) у 5 зірок
          const starRating = Math.round(hotel.rating / 2); 

          return (
            <div key={index} className="hotel-card">
              {/* Тепер imageUrl - це карта з Geoapify */}
              <img src={hotel.imageUrl} alt={hotel.name} className="hotel-image" />
              <div className="hotel-info">
                <h4>{hotel.name}</h4>
                <div className="hotel-rating">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < starRating ? "star-selected" : "star-unselected"} 
                    />
                  ))}
                  <span style={{ marginLeft: '8px', fontSize: '0.9em' }}>
                    {/* Показуємо наш імітований рейтинг */}
                    {hotel.rating.toFixed(1)} / 10.0
                  </span>
                </div>
                <a 
                  href={hotel.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hotel-link"
                >
                  {/* Посилання тепер веде або на сайт, або на пошук Booking */}
                  Check Availability
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

RecommendedHotels.propTypes = {
  city: PropTypes.string.isRequired,
};

export default RecommendedHotels;