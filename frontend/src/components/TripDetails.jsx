import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import PlacesToVisit from "./PlacesToVisit.jsx";
import UserNavbar from "./UserNavbar.jsx";
import Navbar from "./Navbar.jsx";
import AirportSelect from "./AirportSelect.js";
import "../assets/styles/Offerts.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TripDetails = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState(null);
  const sliderRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [tripReviews, setTripReviews] = useState([]);
  const [newReviewInput, setNewReviewInput] = useState({
    rating: 0,
    comment: "",
  });
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState("");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelers, setTravelers] = useState({
    adults: 2,
    children: [],
  });
  const [errors, setErrors] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const fetchTripDetails = async (offerId) => {
    console.log("Fetching trip details for ID:", offerId);
    try {
      const response = await fetch(`${apiUrl}/api/offers/${offerId}`); 
      if (!response.ok) {
        if (response.status === 404) {
          setErrorMessage("Trip not found. It may have been deleted or does not exist.");
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setTripDetails(data.offer || data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching trip details:", error);
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  const fetchTripReviews = async (offerId) => {
    console.log("Fetching reviews for ID:", offerId);
    try {
      const reviewResponse = await fetch(`${apiUrl}/api/comments/${offerId}`);
      if (!reviewResponse.ok) {
        if (reviewResponse.status === 404) {
          setTripReviews([]);
          return;
        }
        throw new Error(`HTTP ${reviewResponse.status}: ${reviewResponse.statusText}`);
      }
      const reviewData = await reviewResponse.json();
      setTripReviews(reviewData.comments || reviewData || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setTripReviews([]);
      setErrorMessage("Failed to fetch reviews: " + error.message);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    setIsUserAuthenticated(!!authToken);

    if (!/^[0-9a-fA-F]{24}$/.test(offerId)) {
      setErrorMessage("Invalid trip ID format");
      setIsLoading(false);
      return;
    }

    fetchTripDetails(offerId);
  }, [offerId, apiUrl]);

  useEffect(() => {
    if (tripDetails && offerId) {
      fetchTripReviews(offerId);
    }
  }, [tripDetails, offerId, apiUrl]);

  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    if (
      tripDetails &&
      tripDetails.imageUrls &&
      tripDetails.imageUrls.length > 0
    ) {
      setMainImage(tripDetails.imageUrls[0]);
    }
  }, [tripDetails]);

  useEffect(() => {
  if (!tripDetails) return;

  const fetchWeatherForecast = async () => {
    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Weather API key missing");
      return;
    }

    try {
      const city = tripDetails.city || "Warsaw";
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
      );
      if (!geoResponse.ok) throw new Error("Geocoding failed");
      const geoData = await geoResponse.json();
      if (geoData.length === 0) throw new Error("City not found");

      const { lat, lon } = geoData[0];

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`
      );
      if (!weatherResponse.ok) throw new Error(`Weather request failed: ${weatherResponse.status}`);
      const weatherData = await weatherResponse.json();

      setWeatherForecast({
        temperature: `${Math.round(weatherData.main.temp)}°C`,
        condition: weatherData.weather[0].description,
        humidity: `${weatherData.main.humidity}%`,
        wind: `${weatherData.wind.speed} m/s`,
        icon: weatherData.weather[0].icon,
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  fetchWeatherForecast();
}, [tripDetails]);

  useEffect(() => {
    setSelectedFlight("");
  }, [selectedDepartureAirport]);

  const handleBookNowClick = () => {
    navigate("/top-up-balance");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isUserAuthenticated) {
      navigate("/login");
      return;
    }
    if (
      newReviewInput.rating < 1 ||
      newReviewInput.rating > 5 ||
      !newReviewInput.comment.trim()
    ) {
      alert("Please provide a valid rating (1-5) and comment.");
      return;
    }

    try {
      const authToken = localStorage.getItem("token");
      const reviewResponse = await fetch(
        `${apiUrl}/api/comments/${offerId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ 
            message: newReviewInput.comment,
            rating: newReviewInput.rating
          }),
        }
      );
      if (!reviewResponse.ok) throw new Error("Failed to submit review");
      const savedReviewData = await reviewResponse.json();
      setTripReviews([...tripReviews, savedReviewData]);
      setNewReviewInput({ rating: 0, comment: "" });
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review: " + error.message);
    }
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setNewReviewInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarRatingClick = (rating) => {
    setNewReviewInput((prev) => ({ ...prev, rating }));
  };

  const openFullScreen = (index) => {
    setCurrentSlide(index);
    setIsFullScreenOpen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreenOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isFullScreenOpen) return;
    if (e.key === "ArrowLeft") {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    } else if (e.key === "ArrowRight") {
      setCurrentSlide((prev) => Math.min(tripDetails.imageUrls.length - 1, prev + 1));
    } else if (e.key === "Escape") {
      closeFullScreen();
    }
  };

  useEffect(() => {
    if (isFullScreenOpen) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreenOpen, handleKeyDown]);

  const calculateAge = (birthDate, referenceDate) => {
    const refDate = referenceDate ? new Date(referenceDate) : new Date();
    const birth = new Date(birthDate);
    const age = refDate.getFullYear() - birth.getFullYear();
    const monthDiff = refDate.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && refDate.getDate() < birth.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  const validateBirthDate = (birthDate, index) => {
    if (!birthDate) {
      return "Please select a birth date.";
    }
    const referenceDate = selectedDate ? new Date(selectedDate) : new Date();
    const maxDate = new Date(referenceDate);
    maxDate.setFullYear(referenceDate.getFullYear() - 11);
    const birth = new Date(birthDate);
    if (birth < maxDate) {
      return "Child must be 11 years old or younger on the flight date.";
    }
    if (birth > referenceDate) {
      return "Birth date cannot be in the future.";
    }
    return "";
  };

  const calculateTotalPrice = () => {
    if (!tripDetails) return 0;
    const basePrice = tripDetails.price || 0;
    let total = travelers.adults * basePrice;
    travelers.children.forEach((child) => {
      const age = calculateAge(child.birthDate, selectedDate);
      if (age <= 2) {
        total += basePrice * 0.1;
      } else if (age <= 11) {
        total += basePrice * 0.6;
      } else {
        total += basePrice;
      }
    });
    return total.toFixed(2);
  };

  const handleTravelerChange = (type, delta) => {
    setTravelers((prev) => {
      if (type === "adults") {
        const newAdults = Math.max(1, prev.adults + delta);
        return { ...prev, adults: newAdults };
      } else if (type === "children") {
        const newCount = Math.max(0, prev.children.length + delta);
        const newChildren = prev.children.slice(0, newCount);
        if (delta > 0 && newCount > prev.children.length) {
          newChildren.push({ birthDate: "" });
        }
        const newErrors = newChildren.map((child, i) =>
          validateBirthDate(child.birthDate, i)
        );
        setErrors(newErrors);
        return { ...prev, children: newChildren };
      }
      return prev;
    });
  };

  const handleChildBirthDateChange = (index, birthDate) => {
    setTravelers((prev) => {
      const newChildren = [...prev.children];
      newChildren[index] = { ...newChildren[index], birthDate };
      return { ...prev, children: newChildren };
    });

    setErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = validateBirthDate(birthDate, index);
      return newErrors;
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    const hasErrors = errors.some((error) => error !== "");
    if (!hasErrors) {
      setIsModalOpen(false);
    } else {
      alert("Please fix all errors before saving.");
    }
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <p className="text-xl">Loading...</p>
      </div>
    );
  if (errorMessage)
    return (
      <div className="error-message">
        Error: {errorMessage}
        <button onClick={() => navigate("/")} className="book-button mt-4">
          Go Back
        </button>
      </div>
    );
  if (!tripDetails) return <div className="error-message">Trip not found</div>;

  const arrivalIATA = tripDetails.flightConnections && tripDetails.flightConnections.length > 0 
    ? tripDetails.flightConnections[0].arrivalAirportIATA 
    : 'N/A';

  const buildImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) {
      return filename; 
    }
    return `${apiUrl}/${filename}`; 
  };

  const FullScreenModal = () => (
    <div className="fullscreen-modal" style={{ display: isFullScreenOpen ? 'flex' : 'none' }} onClick={closeFullScreen}>
      <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-fullscreen" onClick={closeFullScreen}>×</button>
        {tripDetails.imageUrls && tripDetails.imageUrls[currentSlide] && (
          <img
            src={buildImageUrl(tripDetails.imageUrls[currentSlide])}
            alt="Fullscreen"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        )}
        <button className="nav-arrow left" onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}>‹</button>
        <button className="nav-arrow right" onClick={() => setCurrentSlide((prev) => Math.min(tripDetails.imageUrls.length - 1, prev + 1))}>›</button>
      </div>
    </div>
  );

  return (
    <>
      {isUserAuthenticated ? <UserNavbar /> : <Navbar />}
      <div className="trip-details-page">
        <div className="trip-header">
          <h2 className="trip-title">{tripDetails.title}</h2>
          <div className="trip-rating">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < 4 ? "star-selected" : "star-unselected"}
              />
            ))}
          </div>
          <p className="trip-location">
            {tripDetails.city}, {tripDetails.country}
          </p>
        </div>

        <div className="trip-grid">
          <div className="trip-main">
            <div className="photo-gallery">
              {tripDetails.imageUrls && tripDetails.imageUrls.length > 0 ? (
                <>
                  {mainImage && (
                    <div
                      className="main-photo"
                      onClick={() =>
                        openFullScreen(tripDetails.imageUrls.indexOf(mainImage))
                      }
                    >
                      <img
                        src={buildImageUrl(mainImage)}
                        alt="Main trip"
                        onError={(e) => { 
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                  )}
                  <div className="thumbnails">
                    {tripDetails.imageUrls.map((filename, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${mainImage === filename ? "active" : ""}`}
                        onClick={() => setMainImage(filename)}
                      >
                        <img
                          src={buildImageUrl(filename)}
                          alt={`Thumbnail ${index + 1}`}
                          onError={(e) => { 
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>No images available</p>
              )}
            </div>
          </div>

          <div className="booking-card">
            <div className="traveler-selection">
              <button onClick={openModal} className="traveler-button">
                {travelers.adults} Adult{travelers.adults > 1 ? "s" : ""}{" "}
                {travelers.children.length > 0
                  ? `, ${travelers.children.length} Child${
                      travelers.children.length > 1 ? "ren" : ""
                    }`
                  : ""}
              </button>
            </div>
            <select
              className="date-dropdown"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Select a date</option>
              {tripDetails.availableDates &&
              tripDetails.availableDates.length > 0 ? (
                tripDetails.availableDates.map((date, index) => {
                  const d = new Date(date);
                  const startDate = d.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  const endDate = new Date(
                    d.setDate(d.getDate() + 6)
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  const nights = 7;
                  return (
                    <option key={index} value={date}>
                      {`${startDate} - ${endDate} / ${nights} nights`}
                    </option>
                  );
                })
              ) : (
                <option value="">No dates available</option>
              )}
            </select>
            <AirportSelect
              city={tripDetails.city}
              country={tripDetails.country}
              value={selectedDepartureAirport}
              onChange={setSelectedDepartureAirport}
            />

            <input
              type="text"
              value={arrivalIATA}
              placeholder="Arrival Airport"
              readOnly
              className="arrival-airport"
            />

            <p className="price">Total: {calculateTotalPrice()} PLN</p>
            <button className="book-button" onClick={handleBookNowClick}>
              Book for 48h
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Select Travelers</h3>
              <div className="traveler-group">
                <label>Adults (12+ years):</label>
                <div className="traveler-controls">
                  <button
                    onClick={() => handleTravelerChange("adults", -1)}
                    disabled={travelers.adults <= 1}
                  >
                    -
                  </button>
                  <span>{travelers.adults}</span>
                  <button onClick={() => handleTravelerChange("adults", 1)}>
                    +
                  </button>
                </div>
              </div>
              <div className="traveler-group">
                <label>Children (0–11 years):</label>
                <div className="traveler-controls">
                  <button
                    onClick={() => handleTravelerChange("children", -1)}
                    disabled={travelers.children.length === 0}
                  >
                    -
                  </button>
                  <span>{travelers.children.length}</span>
                  <button onClick={() => handleTravelerChange("children", 1)}>
                    +
                  </button>
                </div>
              </div>
              {travelers.children.map((child, index) => (
                <div key={index} className="child-birth-date">
                  <label>Child {index + 1} Date of Birth:</label>
                  <input
                    type="date"
                    value={child.birthDate}
                    onChange={(e) =>
                      handleChildBirthDateChange(index, e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {child.birthDate && (
                    <p>
                      Age: {calculateAge(child.birthDate, selectedDate)} years
                    </p>
                  )}
                  {errors[index] && (
                    <p className="error-text">{errors[index]}</p>
                  )}
                </div>
              ))}
              <button
                onClick={closeModal}
                className="modal-close-button"
                disabled={errors.some((error) => error !== "")}
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="trip-tabs">
          <ul>
            <li>Photos</li>
            <li>Description</li>
            <li>Reviews</li>
            <li>Maps</li>
            <li>Weather</li>
            <li>What to do</li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="section-heading">Trip Details</h2>
        <p className="detail-text">
          <strong>Description:</strong>{" "}
          {tripDetails.description || "No description available"}
        </p>
        <p className="detail-text">
          <strong>City:</strong> {tripDetails.city}, {tripDetails.country}
        </p>
        <p className="detail-text">
          <strong>Duration:</strong> {tripDetails.duration} days
        </p>
        <p className="detail-text">
          <strong>Price:</strong>{" "}
          {tripDetails.price ? `${tripDetails.price} PLN` : "Price unavailable"}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="section-heading">Flight Details</h2>
        {tripDetails.flightConnections && tripDetails.flightConnections.length > 0 ? (
          <div>
            {tripDetails.flightConnections.map((flight, index) => (
              <p key={index} className="detail-text">
                <strong>Flight {index + 1}:</strong> {flight.departureAirportIATA} → {flight.arrivalAirportIATA} 
                {flight.departureTime ? ` at ${flight.departureTime}` : ''}
              </p>
            ))}
          </div>
        ) : (
          <p className="detail-text"><strong>Arrival Airport:</strong> N/A (No flight data)</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="section-heading">Weather Summary</h2>
        {weatherForecast ? (
          <ul className="list-disc pl-5">
            <li className="list-item">Temperature: {weatherForecast.temperature}</li>
            <li className="list-item">Condition: {weatherForecast.condition}</li>
            <li className="list-item">Humidity: {weatherForecast.humidity}</li>
            <li className="list-item">Wind: {weatherForecast.wind}</li>
          </ul>
        ) : (
          <p className="empty-section-text">Weather data unavailable.</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="section-heading">Places to Visit</h2>
        {tripDetails.placesToVisit && tripDetails.placesToVisit.length > 0 ? (
          <PlacesToVisit places={tripDetails.placesToVisit} />
        ) : (
          <p className="empty-section-text">No places listed.</p>
        )}
      </div>

      <button className="book-button" onClick={handleBookNowClick}>
        Book Now
      </button>

      <div className="mb-8">
        <h2 className="section-heading">Reviews & Ratings</h2>
        {tripReviews.length > 0 ? (
          <div className="space-y-4">
            {tripReviews.map((review) => (
              <div key={review._id || review.id} className="review-card">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < review.rating ? "star-selected" : "star-unselected"
                      }
                    />
                  ))}
                </div>
                <p className="detail-text">{review.message || review.comment}</p>
                <p className="review-username">
                  By {review.username || review.user?.username || "Anonymous"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-section-text">No reviews yet.</p>
        )}
      </div>

      {isUserAuthenticated && (
        <div className="mb-8">
          <h2 className="section-heading">Submit a Review</h2>
          <form onSubmit={handleReviewSubmit} className="review-form">
            <div>
              <label className="block detail-text mb-1">Rating:</label>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < newReviewInput.rating
                        ? "star-selected cursor-pointer"
                        : "star-unselected cursor-pointer"
                    }
                    onClick={() => handleStarRatingClick(i + 1)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block detail-text mb-1">Comment:</label>
              <textarea
                name="comment"
                value={newReviewInput.comment}
                onChange={handleReviewInputChange}
                className="w-full p-2 border rounded-lg"
                rows="4"
                placeholder="Write your review..."
              />
            </div>
            <button type="submit" className="submit-review-button">
              Submit Review
            </button>
          </form>
        </div>
      )}

      <FullScreenModal />
    </>
  );
};

export default TripDetails;