import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const AirportSelect = ({ country, city, value, onChange }) => {
  const [airports, setAirports] = useState([]);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchAirports = async () => {
      if (!country && !city) {
        console.warn(
          "AirportSelect: No country or city provided, skipping fetch."
        );
        return;
      }

      try {
        const params = new URLSearchParams();
        if (country) params.append("country", country);
        if (city) params.append("city", city);
        const queryString = params.toString();
        console.log("Fetching airports with query:", queryString);

        const response = await fetch(`${apiUrl}/api/airports?${queryString}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched airports:", data);
        setAirports(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch airports:", err);
        setError(`Помилка завантаження: ${err.message}`);
        setAirports([]);
      }
    };

    fetchAirports();
  }, [country, city, apiUrl]);

  const handleChange = (e) => {
    const selectedIata = e.target.value;
    console.log("Selected IATA in AirportSelect:", selectedIata);
    if (selectedIata) {
      onChange(selectedIata);
    }
  };

  const validAirports = airports.filter(
    (airport) => airport.iata && airport.iata.trim() !== ""
  );

  return (
    <div className="airport-select-wrapper">
      {error && (
        <div style={{ color: "red", fontSize: "12px", marginBottom: "5px" }}>
          {error}
        </div>
      )}
      {validAirports.length === 0 && (
        <div style={{ color: "orange", fontSize: "12px" }}>
          Airports with IATA not found (codes only)
        </div>
      )}
      <select
        value={value || ""}
        onChange={handleChange}
        className="form-input"
        style={{ width: "100%", padding: "8px" }}
      >
        <option value="">{value ? "Змінюємо..." : "Select Airport"}</option>
        {validAirports.map((airport) => {
          const iata = airport.iata.trim();
          const displayText = `${airport.name || "Unknown"} (${iata})`;
          return (
            <option key={iata} value={iata}>
              {displayText}
            </option>
          );
        })}
      </select>
      {value && !validAirports.some((a) => a.iata === value) && (
        <div style={{ color: "orange", fontSize: "12px", marginTop: "5px" }}>
          Previous value: {value} (not in the list){" "}
        </div>
      )}
    </div>
  );
};

AirportSelect.propTypes = {
  city: PropTypes.string,
  country: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default AirportSelect;
