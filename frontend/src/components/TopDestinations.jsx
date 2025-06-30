import React, { useState, useEffect } from 'react';
import '../assets/styles/TopDestinations.css';
import { useNavigate, useParams } from 'react-router-dom';

import paris from '../assets/img/paris.png';
import bali from '../assets/img/bali.jpg';
import newyork from '../assets/img/newyork.jpg';
import tokyo from '../assets/img/tokyo.jpg';
import dubai from '../assets/img/dubai.jpg';

const images = {
  paris,
  bali,
  newyork,
  tokyo,
  dubai,
};

const fallbackDestinations = [
  {
    name: 'Paris, France',
    tags: ['Culture', 'Museum', 'Romantic', 'Historical', 'Art'],
    count: '4+',
    key: 'paris',
    image: images['paris'],
    description: 'The romantic capital known for the Eiffel Tower, art museums, and charming cafés.',
    price: 'from 3000 PLN'
  },
  {
    name: 'Bali, Indonesia',
    tags: ['Ocean', 'Relax', 'Nature', 'Yoga', 'Adventure', 'Beach'],
    count: '5+',
    key: 'bali',
    image: images['bali'],
    description: 'A tropical paradise famous for its beaches, temples, and laid-back vibes.',
    price: 'From 6000 PLN',
  },
  {
    name: 'New York, USA',
    tags: ['City', 'Nightlife', 'Broadway', 'Skyscrapers', 'Shopping'],
    count: '4+',
    key: 'newyork',
    image: images['newyork'],
    description: 'The city that never sleeps — home to skyscrapers, Broadway, and global culture.',
    price: 'from 3600 PLN'
  },
  {
    name: 'Tokyo, Japan',
    tags: ['Culture', 'Technology', 'Innovation', 'Temples', 'Futuristic'],
    count: '4+',
    key: 'tokyo',
    image: images['tokyo'],
    description: 'A futuristic metropolis blending ancient traditions with cutting-edge innovation.',
    price: 'from 5500 PLN'
  },
  {
    name: 'Dubai, UAE',
    tags: ['Luxury', 'Shopping', 'Skyscrapers', 'Desert', 'Adventure'],
    count: '4+',
    key: 'dubai',
    image: images['dubai'],
    description: 'A dazzling destination offering luxury, skyscrapers, and desert adventures.',
    price: 'from 3500 PLN'
  },
];

const TopDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDestinations(fallbackDestinations);
    setSelected(fallbackDestinations[0]);
  }, []);

  const handleOpen = (dest) => {
    setSelected(dest);
    setShowModal(true);
  };

  const handleMore = () => {
    if (selected?.key) {
      navigate(`/destination/${selected.key}`);
    }
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

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
              <span className="tag">{dest.tags[0]}</span>
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

      {/* Custom Modal */}
      {showModal && selected && (
        <div className="modal-overlay">
          <div className="modal">
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
                <div className="price-label">
                  Price: {selected.price}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handleMore}>
                More Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopDestinations;