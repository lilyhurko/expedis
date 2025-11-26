import React, { useState, useEffect } from "react";
import "../assets/styles/TopDestinations.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5001"; 
const FALLBACK_IMAGE = "https://placehold.co/600x400?text=No+Image";

const TopDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getImageUrl = (offer) => {
    let imagePath = null;

    if (offer.imageUrls && offer.imageUrls.length > 0) {
      imagePath = offer.imageUrls[0];
    } 
    else if (offer.imageUrl) {
      imagePath = offer.imageUrl;
    }

    if (!imagePath) return FALLBACK_IMAGE;

    return imagePath.startsWith("http") ? imagePath : `${API_URL}${imagePath}`;
  };

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/offers`);
      
        const fetchedDestinations = response.data.slice(0, 5).map((offer) => ({
          name: offer.title,
          tags: offer.categories,
          count: offer.categories.length.toString(), 
          key: offer._id,
          image: getImageUrl(offer), 
          description: offer.description,
          price: `from ${offer.price} PLN`,
          duration: `${offer.duration} days`,
        }));

        setDestinations(fetchedDestinations);
        setSelected(fetchedDestinations[0] || null);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Failed to load destinations.");
      }
    };

    fetchDestinations();
  }, []);

  const handleSelect = (dest) => {
    setSelected(dest);
  };

  const handleImageClick = () => {
    if (selected) {
      navigate(`/offer/${selected.key}`);
    }
  };

  if (error) return null; 

  return (
    <div className="top-destinations-section">
      <div className="top-destinations-header">
        <h2 className="top-destinations-title">Top Destinations of the Week</h2>
        <p className="top-destinations-description">
          Explore the most popular travel spots chosen by adventurers this week!
        </p>
      </div>

      <div className="content">
        <div className="destination-list">
          {destinations.map((dest) => (
            <div
              key={dest.key}
              className={`city ${selected?.key === dest.key ? "active" : ""}`}
              onClick={() => handleSelect(dest)}
            >
              <span>{dest.name}</span>
              <div className="city-badges">
                 <span className="tag">{dest.tags[0] || "Trip"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="destination-image" onClick={handleImageClick} style={{cursor: 'pointer'}} title="Click to view details">
          {selected ? (
            <img 
              src={selected.image} 
              alt={selected.name} 
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }} 
            />
          ) : (
            <div className="placeholder-box">Select a destination</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopDestinations;