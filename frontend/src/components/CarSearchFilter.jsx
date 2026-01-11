import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaTag,
  FaDollarSign,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

import { DateRange } from "react-date-range";
import { format } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../assets/styles/CarSearchFilter.css";

const carCategories = [
  "Sedan (Compact)",
  "SUV/Crossover",
  "Sedan",
  "Sedan (Grand Turismo)",
  "SUV/Crossover (Coupe)",
  "Hatchback",
  "Sedan (Luxury)",
  "Sedan (Executive)",
];

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
};

const CarSearchFilter = ({ onSearch, initialParams, availableLocations = [] }) => {
  const [localParams, setLocalParams] = useState({
    city: initialParams.city || "",
    category: initialParams.category || "",
    maxPrice: initialParams.maxPrice || "",
  });

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [isDateSet, setIsDateSet] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState("");

  const [isLocOpen, setIsLocOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const [openCountries, setOpenCountries] = useState({});

  const locRef = useRef(null);
  const catRef = useRef(null);
  const dateRef = useRef(null);

  useClickOutside(locRef, () => setIsLocOpen(false));
  useClickOutside(catRef, () => setIsCatOpen(false));
  useClickOutside(dateRef, () => setIsDateOpen(false));

  const handleLocationSelect = (value) => {
    setLocalParams((prev) => ({ 
        ...prev, 
        city: value === localParams.city ? "" : value 
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
       setLocalParams((prev) => ({ ...prev, category: value }));
    } else {
       setLocalParams((prev) => ({ ...prev, category: "" }));
    }
  };

  const handlePriceChange = (e) => {
    setLocalParams((prev) => ({ ...prev, maxPrice: e.target.value }));
    if (errorMessage) setErrorMessage("");
  };

  const toggleCountry = (countryName) => {
    setOpenCountries((prev) => ({
      ...prev,
      [countryName]: !prev[countryName],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    if (localParams.maxPrice) {
      const price = parseFloat(localParams.maxPrice);
      
      if (isNaN(price) || price <= 0) {
        setErrorMessage(
          "Unless you're hoping for a free ride (we wish!), please enter a price greater than zero. 💸"
        );
        return; 
      }
    }

    let datesObj = {};
    if (isDateSet) {
      datesObj = {
        pickupDate: format(dateRange[0].startDate, "yyyy-MM-dd"),
        returnDate: format(dateRange[0].endDate, "yyyy-MM-dd"),
      };
    }
    onSearch({ ...localParams, ...datesObj });
  };

  return (
    <div className="car-search-container">
      <h3>Smart car rentals, made simple!</h3>
      <p className="car-search-subtitle">
        Find reliable vehicles, clear pricing, and flexible pickup options — all in one place.
      </p>

      <form className="car-search-bar" onSubmit={handleSubmit}>
        
        <div className="search-bar-pill-dropdown" ref={locRef}>
          <button
            type="button"
            className="pill-dropdown-button"
            onClick={() => setIsLocOpen((prev) => !prev)}
          >
            <FaSearch className="search-bar-icon" />
            <span>
              {localParams.city ? localParams.city : "City, Country"}
            </span>
          </button>

          {isLocOpen && (
            <div className="filter-dropdown-menu">
              {availableLocations.length > 0 ? (
                availableLocations.map((group, i) => (
                  <div key={i} className="country-group">
                    <div className="country-row">
                      <label className="filter-dropdown-item" style={{ flexGrow: 1 }}>
                        <input
                            type="checkbox"
                            value={group.country}
                            checked={localParams.city === group.country}
                            onChange={() => handleLocationSelect(group.country)}
                        />
                        {group.country}
                      </label>
                      
                      <button
                        type="button"
                        className="toggle-cities-btn"
                        onClick={() => toggleCountry(group.country)}
                      >
                        {openCountries[group.country] ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                    </div>
                    
                    {openCountries[group.country] && (
                      <div className="city-list">
                        {group.cities.map((city, j) => (
                          <label
                            key={j}
                            className="filter-dropdown-item city-item"
                          >
                            <input
                              type="checkbox"
                              value={city}
                              checked={localParams.city === city}
                              onChange={() => handleLocationSelect(city)}
                            />
                            {city}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: "10px", color: "#ddd" }}>No locations</div>
              )}
            </div>
          )}
        </div>

        <div className="search-bar-pill-dropdown" ref={catRef}>
          <button
            type="button"
            className="pill-dropdown-button"
            onClick={() => setIsCatOpen((prev) => !prev)}
          >
            <FaTag className="search-bar-icon" />
            <span>
              {localParams.category ? localParams.category : "All Categories"}
            </span>
          </button>
          
          {isCatOpen && (
            <div className="filter-dropdown-menu">
              {carCategories.map((cat, i) => (
                <label key={i} className="filter-dropdown-item">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={localParams.category === cat}
                    onChange={handleCategoryChange}
                  />
                  {cat}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="search-bar-pill-dropdown" style={{ flex: 0.9 }}>
            <div className="pill-dropdown-button" style={{ cursor: 'text' }}>
                <FaDollarSign className="search-bar-icon" />
                <input 
                    type="number" 
                    placeholder="Price" 
                    value={localParams.maxPrice}
                    onChange={handlePriceChange}
                    className="pill-transparent-input"
                    min="0" 
                />
            </div>
        </div>

        <div className="search-bar-pill-dropdown" ref={dateRef}>
          <button
            type="button"
            className="pill-dropdown-button"
            onClick={() => setIsDateOpen((prev) => !prev)}
          >
            <FaCalendarAlt className="search-bar-icon" />
            <span>
              {isDateSet
                ? `${format(dateRange[0].startDate, "dd.MM.yyyy")} - ${format(
                    dateRange[0].endDate,
                    "dd.MM.yyyy"
                  )}`
                : "Dates"}
            </span>
          </button>

          {isDateOpen && (
            <div className="filter-dropdown-menu calendar">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => {
                  setDateRange([item.selection]);
                  setIsDateSet(true);
                }}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                months={2}
                direction="horizontal"
                rangeColors={['#1b3a4b']}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {errorMessage && (
                <div style={{ 
                    color: "#dc3545", 
                    fontSize: "0.85rem", 
                    marginBottom: "8px", 
                    fontWeight: "bold",
                    textAlign: "center",
                    maxWidth: "300px"
                }}>
                    {errorMessage}
                </div>
            )}
            
            <button type="submit" className="search-bar-button-pill">
              Search
            </button>
        </div>
      </form>
    </div>
  );
};

export default CarSearchFilter;