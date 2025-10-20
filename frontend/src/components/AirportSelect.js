import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const countryToISO = {
  "Poland": "PL",
  "France": "FR",
  "United States": "US",
  "Germany": "DE",
  "Spain": "ES",
  "Italy": "IT",
  "United Kingdom": "GB",
  "Greece": "GR",
  "Portugal": "PT",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Switzerland": "CH",
  "Austria": "AT",
  "Czech Republic": "CZ",
  "Hungary": "HU",
  "Croatia": "HR",
  "Turkey": "TR",
  "Egypt": "EG",
  "Morocco": "MA",
  "Tunisia": "TN",
  "Thailand": "TH",
  "Japan": "JP",
  "South Korea": "KR",
  "China": "CN",
  "India": "IN",
  "United Arab Emirates": "AE",
  "Australia": "AU",
  "New Zealand": "NZ",
  "Canada": "CA",
  "Mexico": "MX",
  "Brazil": "BR",
  "Argentina": "AR",
  "South Africa": "ZA",
};

const AirportSelect = ({ 
  country, 
  city, 
  value, 
  onChange, 
  isDeparture = false 
}) => {
  const [airports, setAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAirport, setExistingAirport] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Fetch the existing airport details if value exists but not in current search
  useEffect(() => {
    setExistingAirport(null); // Reset
    if (!value) return;
    // Якщо потрібно, можеш фетчити по city/country + value як fallback, але зараз custom option вистачить
    console.log("Existing value:", value); // DEBUG
  }, [value]);

  // Fetch airports based on location
  const fetchAirports = async (countryQuery, cityQuery) => {
    if (!cityQuery && !countryQuery) {
      console.log("AirportSelect: No city or country provided, skipping fetch.");
      setAirports([]);
      return;
    }

    setIsLoading(true);
    const isoCountry = countryQuery ? (countryToISO[countryQuery] || countryQuery) : null;
    
    console.log(`Fetching airports: country=${isoCountry || 'none'}, city=${cityQuery || 'none'}, existing value=${value || 'none'}`);
    
    try {
      const params = new URLSearchParams();
      if (cityQuery) params.append('city', cityQuery);
      if (isoCountry) params.append('country', isoCountry);
      
      const response = await fetch(`${apiUrl}/api/airports?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      console.log("Fetched airports:", data);
      setAirports(data || []);
    } catch (error) {
      console.error("Error fetching airports:", error);
      setAirports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      fetchAirports(country, city);
    } else if (isDeparture && country) {
      fetchAirports(country, null);
    } else {
      setAirports([]);
    }
  }, [country, city, isDeparture]);

  const handleSelect = (iata) => {
    console.log(`Selected IATA in AirportSelect: ${iata}`);
    onChange(iata);
  };

  if (isLoading) {
    return (
      <select className="form-input" disabled>
        <option>Loading airports...</option>
      </select>
    );
  }

  const airportOptions = [];
  
  airports.forEach((airport) => {
    airportOptions.push(
      <option key={airport.iata || airport.icao} value={airport.iata || airport.icao}>
        {airport.name} ({airport.iata || airport.icao}) - {airport.city}
      </option>
    );
  });

  const valueInList = airports.some(a => a.iata === value || a.icao === value);
  if (value && !valueInList) {
    airportOptions.unshift(
      <option key="existing-value" value={value}>
        {value} [Previous Selection - from different location]
      </option>
    );
  }

  return (
    <select 
      value={value || ""} 
      onChange={(e) => handleSelect(e.target.value)} 
      className="form-input"
    >
      <option value="">Select Airport</option>
      {airportOptions}
      {airports.length === 0 && !value && (
        <option value="" disabled>
          No airports found for {city || country}
        </option>
      )}
    </select>
  );
};

AirportSelect.propTypes = {
  country: PropTypes.string,
  city: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isDeparture: PropTypes.bool,
};

export default AirportSelect;