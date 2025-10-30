import React, { useState, useEffect } from 'react'; // Додано useEffect
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa'; 
import '../assets/styles/TripSearchFilter.css';

const TripSearchFilter = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (destination) queryParams.set('destination', destination);
    if (date) queryParams.set('date', date);

    navigate(`/trips?${queryParams.toString()}`);
  };

  useEffect(() => {
    if (destination.length < 2) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/offers/suggestions?q=${destination}`);
        const data = await response.json();
        setSuggestions(data);
        setIsSuggestionsOpen(data.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const timerId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timerId);

  }, [destination]); 

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setDestination(suggestion); 
    setSuggestions([]); 
    setIsSuggestionsOpen(false);
  };

  return (
    <div className="trip-search-container">
      <h3>Plan your perfect trip with ease!</h3>
      <p className="trip-search-subtitle">
        Find the best flight deals, cozy accommodations, and real-time weather updates—all in one place. Start your journey now!
      </p>
      
      <form className="trip-search-bar" onSubmit={handleSearch}>
        
        <div className="search-bar-pill" style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="City, Country" 
            value={destination}
            onChange={handleDestinationChange} 
            autoComplete="off" 
            onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 200)}
            onFocus={() => suggestions.length > 0 && setIsSuggestionsOpen(true)}
          />
          <FaSearch className="search-bar-icon" />
          
          {isSuggestionsOpen && (
            <ul className="suggestions-list">
              {suggestions.map((s, index) => (
                <li key={index} onMouseDown={() => handleSuggestionClick(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="search-bar-pill">
          <input 
            type="text"
            placeholder="Date"
            value={date}
            onChange={e => setDate(e.target.value)}
            onFocus={(e) => e.target.type = 'date'}
            onBlur={(e) => { if(!e.target.value) e.target.type = 'text' }}
          />
          <FaCalendarAlt className="search-bar-icon" />
        </div>
        
        <button type="submit" className="search-bar-button-pill">
          Search
        </button>
      </form>
    </div>
  );
};

export default TripSearchFilter;