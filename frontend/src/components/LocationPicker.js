import React, { useState, useEffect } from 'react';

const LocationPicker = ({ setCityCountry, initialCity = '', initialCountry = '' }) => {
  const [cityInput, setCityInput] = useState(initialCity);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (cityInput.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&addressdetails=1&limit=5&featuretype=city`
        );
        const data = await res.json();
        const citySuggestions = data
          .filter(item => item.address.city || item.address.town || item.address.village)
          .map(item => ({
            name: item.address.city || item.address.town || item.address.village,
            country: item.address.country || '',
            lat: item.lat,
            lon: item.lon,
          }));
        setSuggestions(citySuggestions);
        setShowSuggestions(true);
        setError('');
      } catch (err) {
        setError('Error fetching city suggestions.');
        setSuggestions([]);
        setShowSuggestions(false);
        console.error(err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [cityInput]);

const handleCitySelect = (suggestion) => {
  setCityInput(suggestion.name);
  setCityCountry({ 
    city: suggestion.name, 
    country: suggestion.country,
    lat: suggestion.lat, 
    lng: suggestion.lon  
  });
  setShowSuggestions(false);
  setError('');
};

const handleCityChange = (e) => {
  setCityInput(e.target.value);
  if (!e.target.value) {
    setCityCountry({ city: '', country: '', lat: null, lng: null }); 
    setShowSuggestions(false);
    setError('');
  }
};

  return (
    <div className="form-group location-picker">
      <input
        className="form-input"
        type="text"
        value={cityInput}
        onChange={handleCityChange}
        placeholder="Enter city name"
        onFocus={() => cityInput.length >= 2 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {error && <p className="error-message">{error}</p>}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="suggestion-item"
              onMouseDown={() => handleCitySelect(suggestion)}
            >
              {suggestion.name}, {suggestion.country}
            </li>
          ))}
        </ul>
      )}
      {(cityInput || initialCity) && (initialCountry || suggestions.find(s => s.name === cityInput)?.country) && (
        <p>
          <strong>Selected:</strong> {cityInput || initialCity}, {suggestions.find(s => s.name === cityInput)?.country || initialCountry}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;