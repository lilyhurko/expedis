import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaCalendarAlt,
  FaTag,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";

import { DateRange } from "react-date-range";
import { format } from "date-fns";

import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 

import "../assets/styles/TripSearchFilter.css";

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

const TripSearchFilter = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedDestinations, setSelectedDestinations] = useState(
    searchParams.getAll("destination") || []
  );
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.getAll("category") || []
  );

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [isDateSet, setIsDateSet] = useState(false); 

  const [allCategories, setAllCategories] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [openCountries, setOpenCountries] = useState({});

  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false); 

  const destRef = useRef(null);
  const catRef = useRef(null);
  const dateRef = useRef(null); 

  useClickOutside(destRef, () => setIsDestOpen(false));
  useClickOutside(catRef, () => setIsCatOpen(false));
  useClickOutside(dateRef, () => setIsDateOpen(false)); 

  useEffect(() => {
    fetch("/api/offers/categories")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setAllCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));

    fetch("/api/offers/alldestinations")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setAllDestinations(data))
      .catch((err) => console.error("Error fetching destinations:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    selectedDestinations.forEach((dest) =>
      queryParams.append("destination", dest)
    );
    selectedCategories.forEach((cat) => queryParams.append("category", cat));

    if (isDateSet) {
      queryParams.set("startDate", dateRange[0].startDate.toISOString());
      queryParams.set("endDate", dateRange[0].endDate.toISOString());
    }

    navigate(`/trips?${queryParams.toString()}`);
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCategories((prev) => [...prev, value]);
    } else {
      setSelectedCategories((prev) => prev.filter((cat) => cat !== value));
    }
  };

  const handleDestinationChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedDestinations((prev) => [...prev, value]);
    } else {
      setSelectedDestinations((prev) => prev.filter((dest) => dest !== value));
    }
  };

  const toggleCountry = (countryName) => {
    setOpenCountries((prev) => ({
      ...prev,
      [countryName]: !prev[countryName],
    }));
  };


  return (
    <div className="trip-search-container">
      <h3>Plan your perfect trip with ease!</h3>
      <p className="trip-search-subtitle">
        Find the best flight deals, cozy accommodations, and real-time weather
        updates—all in one place. Start your journey now!
      </p>

      <form className="trip-search-bar" onSubmit={handleSearch}>
        <div className="search-bar-pill-dropdown" ref={destRef}>
          <button
            type="button"
            className="pill-dropdown-button"
            onClick={() => setIsDestOpen((prev) => !prev)}
          >
            <FaSearch className="search-bar-icon" />
            <span>
              {selectedDestinations.length > 0
                ? `${selectedDestinations.length} destinations`
                : "City, Country"}
            </span>
          </button>

          {isDestOpen && (
            <div className="filter-dropdown-menu">
              {allDestinations.map((group, i) => (
                <div key={i} className="country-group">
                  <div className="country-row">
                    <label className="filter-dropdown-item">
                      <input
                        type="checkbox"
                        value={group.country}
                        checked={selectedDestinations.includes(group.country)}
                        onChange={handleDestinationChange}
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
                            checked={selectedDestinations.includes(city)}
                            onChange={handleDestinationChange}
                          />
                          {city}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
              {selectedCategories.length > 0
                ? `${selectedCategories.length} categories`
                : "All Categories"}
            </span>
          </button>
          {isCatOpen && (
            <div className="filter-dropdown-menu">
              {allCategories.map((cat, i) => (
                <label key={i} className="filter-dropdown-item">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={selectedCategories.includes(cat)}
                    onChange={handleCategoryChange}
                  />
                  {cat}
                </label>
              ))}
            </div>
          )}
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
                : "Date"}
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
              />
            </div>
          )}
        </div>

        <button type="submit" className="search-bar-button-pill">
          Search
        </button>
      </form>
    </div>
  );
};

export default TripSearchFilter;