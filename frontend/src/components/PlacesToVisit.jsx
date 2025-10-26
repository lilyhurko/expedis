import React from 'react';
import PropTypes from 'prop-types';

const PlacesToVisit = ({ places }) => {
  return (
    <div className="places-to-visit">
      {places.length === 0 ? (
        <p>No places added yet.</p>
      ) : (
        <div className="places-grid">
          {places.map((place, index) => (
            <div key={index} className="place-card">
              {place.imageUrl && <img src={place.imageUrl} alt={place.name} className="place-image" />}
              <h4>{place.name}</h4>
              <p>{place.description || 'No description available'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

PlacesToVisit.propTypes = {
  places: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
    })
  ).isRequired,
};

export default PlacesToVisit;