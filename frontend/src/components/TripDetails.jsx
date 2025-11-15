import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaTag,
  FaPlane,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaSun,
  FaMoon,
  FaTint,
  FaWater,
} from "react-icons/fa";
import PlacesToVisit from "./PlacesToVisit.jsx"; 
import UserNavbar from "./UserNavbar.jsx";
import Navbar from "./Navbar.jsx";
import styles from "../assets/styles/TripDetails.module.css";
import "../assets/styles/Offerts.css";
import modalStyles from "../assets/styles/Modals.module.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import RecommendedHotels from "./RecommendedHotels.jsx";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const TripDetails = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [monthlyWeather, setMonthlyWeather] = useState(null);
  const [tripReviews, setTripReviews] = useState([]);
  const [newReviewInput, setNewReviewInput] = useState({
    rating: 0,
    comment: "",
  });
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDepartureAirport, setSelectedDepartureAirport] = useState("");
  const [arrivalIATA, setArrivalIATA] = useState("");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelers, setTravelers] = useState({
    adults: 2,
    children: [],
  });
  const [errors, setErrors] = useState([]);
  const [viewMode, setViewMode] = useState("year");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
  const photosRef = useRef(null);
  const descriptionRef = useRef(null);
  const reviewsRef = useRef(null);
  const weatherRef = useRef(null);
  const placesRef = useRef(null);

  const handleScrollTo = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  
  const getFullFlightDate = (baseDate, timeString) => {
    if (!baseDate || !timeString) return null;
    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    const newDate = new Date(baseDate);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const calculateDuration = (start, end) => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "N/A";
    }
    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      end.setDate(end.getDate() + 1);
      diffMs = end.getTime() - start.getTime();
    }
    if (diffMs < 0) {
      return "N/A";
    }
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
  };
  
  const formatFlightArcDate = (date) => {
    if (!date || isNaN(date.getTime())) return "Select Date";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatFlightTimeline = (date) => {
    if (!date || isNaN(date.getTime())) return "N/A";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", ", ");
  };

  const fetchTripDetails = useCallback(
    async (offerId) => {
      try {
        const response = await fetch(`${apiUrl}/api/offers/${offerId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setErrorMessage(
              "Trip not found. It may have been deleted or does not exist."
            );
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.offer && data.weather) {
          setTripDetails(data.offer);
          setMonthlyWeather(
            data.weather && data.weather.length > 0 ? data.weather : null
          );
        } else {
          setTripDetails(data.offer || data);
          setMonthlyWeather(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching trip details:", error);
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  const fetchTripReviews = useCallback(
    async (offerId) => {
      try {
        const reviewResponse = await fetch(`${apiUrl}/api/comments/${offerId}`);
        if (!reviewResponse.ok) {
          if (reviewResponse.status === 404) {
            setTripReviews([]);
            return;
          }
          throw new Error(
            `HTTP ${reviewResponse.status}: ${reviewResponse.statusText}`
          );
        }
        const reviewData = await reviewResponse.json();
        setTripReviews(reviewData.comments || reviewData || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setTripReviews([]);
        setErrorMessage("Failed to fetch reviews: " + error.message);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    setIsUserAuthenticated(!!authToken);
    if (!/^[0-9a-fA-F]{24}$/.test(offerId)) {
      setErrorMessage("Invalid trip ID format");
      setIsLoading(false);
      return;
    }
    fetchTripDetails(offerId);
  }, [offerId, apiUrl, fetchTripDetails]);

  useEffect(() => {
    if (tripDetails && offerId) {
      fetchTripReviews(offerId);
    }
  }, [tripDetails, offerId, apiUrl, fetchTripReviews]);

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
    if (tripDetails?.flightConnections?.length > 0) {
      if (!selectedDepartureAirport) {
        const firstDeparture =
          tripDetails.flightConnections[0].departureAirportIATA;
        setSelectedDepartureAirport(firstDeparture);
        setArrivalIATA(tripDetails.flightConnections[0].arrivalAirportIATA);
      }
    }
  }, [tripDetails, selectedDepartureAirport]);

  useEffect(() => {
    if (
      selectedDepartureAirport &&
      tripDetails?.flightConnections?.length > 0
    ) {
      const connection = tripDetails.flightConnections.find(
        (f) => f.departureAirportIATA === selectedDepartureAirport
      );
      if (connection) {
        setArrivalIATA(connection.arrivalAirportIATA);
      } else {
        setArrivalIATA("N/A");
      }
    }
  }, [selectedDepartureAirport, tripDetails]);

  const handleBookNowClick = () => {
    navigate("/top-up-balance");
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isUserAuthenticated) {
      navigate("/login");
      return;
    }
    if (!newReviewInput.rating || !newReviewInput.comment.trim()) {
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
            rating: newReviewInput.rating,
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
  const closeFullScreen = useCallback(() => {
    setIsFullScreenOpen(false);
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) =>
          Math.min(tripDetails?.imageUrls?.length - 1 || 0, prev + 1)
        );
      } else if (e.key === "Escape") {
        closeFullScreen();
      }
    };
    if (isFullScreenOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreenOpen, closeFullScreen, tripDetails?.imageUrls?.length]);
  const calculateAge = (birthDate, referenceDate) => {
    const refDate = referenceDate ? new Date(referenceDate) : new Date();
    const birth = new Date(birthDate);
    let age = refDate.getFullYear() - birth.getFullYear();
    const monthDiff = refDate.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && refDate.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };
  const validateBirthDate = (birthDate, index) => {
    if (!birthDate) return "Please select a birth date.";
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
      if (age <= 2) total += basePrice * 0.1;
      else if (age <= 11) total += basePrice * 0.6;
      else total += basePrice;
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
    if (!hasErrors) setIsModalOpen(false);
    else alert("Please fix all errors before saving.");
  };
  const averageRating = useMemo(() => {
    if (!tripReviews || tripReviews.length === 0) return 0;
    const total = tripReviews.reduce(
      (acc, review) => acc + (review.rating || 0),
      0
    );
    return Math.round(total / tripReviews.length);
  }, [tripReviews]);

  const monthLabels = [
    "Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru",
  ];
  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
  ];

  const sortedWeather = useMemo(
    () =>
      monthlyWeather
        ? [...monthlyWeather].sort((a, b) => a.month - b.month)
        : [],
    [monthlyWeather]
  );

  const chartData = useMemo(
    () => ({
      labels: monthLabels,
      datasets: [
        {
          label: "Temperatura w dniu (°C)",
          data: sortedWeather.map((m) => m.avg_temp),
          borderColor: "rgb(255, 165, 0)",
          backgroundColor: "rgba(255, 165, 0, 0.5)",
          type: "line",
          yAxisID: "y_temp",
          datalabels: {
            align: "top",
            color: "#333",
            font: { weight: "bold", family: "Poppins", size: 10 },
            formatter: (value) => (value ? value + "°C" : ""),
            offset: 8,
          },
        },
      ],
    }),
    [sortedWeather, monthLabels]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
        datalabels: {
          display: true,
          anchor: "end",
        },
      },
      scales: {
        y_temp: {
          display: false,
          min: Math.min(...sortedWeather.map(m => m.avg_temp)) - 5,
          max: Math.max(...sortedWeather.map(m => m.avg_temp)) + 5,
        },
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            display: true,
            font: {
              family: "Poppins",
              weight: "500",
              size: 14,
            },
            color: "#555",
          },
        },
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 3
        },
        point: {
          radius: 4,
          backgroundColor: "rgb(255, 165, 0)",
        },
      },
    }),
    [sortedWeather]
  );

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

  let outboundFlight = tripDetails.flightConnections.find(
    (f) => f.flightType === "outbound"
  );
  let returnFlight = tripDetails.flightConnections.find(
    (f) => f.flightType === "return"
  );
  if (!outboundFlight && tripDetails.flightConnections.length > 0)
    outboundFlight = tripDetails.flightConnections[0];
  if (!returnFlight && tripDetails.flightConnections.length > 1)
    returnFlight = tripDetails.flightConnections[1];
  let outboundDepDate, outboundArrDate, returnDepDate, returnArrDate;
  if (selectedDate) {
    const departureBaseDate = new Date(selectedDate);
    const returnBaseDate = new Date(departureBaseDate);
    returnBaseDate.setDate(
      departureBaseDate.getDate() + (tripDetails.duration - 1)
    );
    if (outboundFlight) {
      outboundDepDate = getFullFlightDate(
        departureBaseDate,
        outboundFlight.departureTime
      );
      outboundArrDate = getFullFlightDate(
        departureBaseDate,
        outboundFlight.arrivalTime
      );
    }
    if (returnFlight) {
      returnDepDate = getFullFlightDate(
        returnBaseDate,
        returnFlight.departureTime
      );
      returnArrDate = getFullFlightDate(
        returnBaseDate,
        returnFlight.arrivalTime
      );
    }
  }

  const buildImageUrl = (filename) => {
    if (!filename || filename === "") return null;
    if (filename.startsWith("http")) return filename;
    return `${apiUrl}${filename}`;
  };
  
  const FullScreenModal = () => (
    <div
      className={`${styles.fullscreenModal} ${
        isFullScreenOpen ? styles.open : ""
      }`}
      onClick={closeFullScreen}
    >
      <div
        className={styles.fullscreenContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeFullscreen} onClick={closeFullScreen}>
          ×
        </button>
        {tripDetails?.imageUrls && tripDetails.imageUrls[currentSlide] && (
          <img
            src={buildImageUrl(tripDetails.imageUrls[currentSlide])}
            alt="Fullscreen"
            className={styles.fullscreenImage}
          />
        )}
        <button
          className={`${styles.navArrow} ${styles.left}`}
          onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
        >
          ‹
        </button>
        <button
          className={`${styles.navArrow} ${styles.right}`}
          onClick={() =>
            setCurrentSlide((prev) =>
              Math.min(tripDetails?.imageUrls?.length - 1 || 0, prev + 1)
            )
          }
        >
          ›
        </button>
      </div>
    </div>
  );
  
  const sampleTripDescription = `Embark on an unforgettable journey to ${tripDetails.city}, ${tripDetails.country}, where ancient history blends seamlessly with vibrant modern life. Over ${tripDetails.duration} days, you'll explore iconic landmarks like the historic old town and stunning coastal views. Indulge in authentic local cuisine, from fresh seafood to traditional pastries, and unwind in charming accommodations. This carefully curated trip includes guided tours, insider tips, and plenty of free time to discover hidden gems at your own pace. Whether you're a culture enthusiast or a nature lover, this adventure promises memories that last a lifetime.`;
  
  return (
    <>
      {isUserAuthenticated ? <UserNavbar /> : <Navbar />}
      <div className={styles.tripDetailsPage}>
        <div className={styles.tripHeader}>
          <h2 className={styles.tripTitle}>{tripDetails.title}</h2>
          <div className={styles.tripRating}>
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < averageRating
                    ? styles.starSelected
                    : styles.starUnselected
                }
              />
            ))}
          </div>
          <p className={styles.tripLocation}>
            {tripDetails.city}, {tripDetails.country}
          </p>
        </div>
        <div className={styles.tripGrid}>
          <div className={styles.tripMain}>
            <div className={styles.photoGallery} ref={photosRef}>
              {tripDetails.imageUrls && tripDetails.imageUrls.length > 0 ? (
                <>
                  {mainImage && buildImageUrl(mainImage) && (
                    <div
                      className={styles.mainPhoto}
                      onClick={() =>
                        openFullScreen(tripDetails.imageUrls.indexOf(mainImage))
                      }
                    >
                      <img
                        src={buildImageUrl(mainImage)}
                        alt="Main trip"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p>No images available</p>
              )}
            </div>
          </div>
          <div className={styles.bookingCard}>
            <div>
              <div className={styles.travelerSelection}>
                <button onClick={openModal} className={styles.travelerButton}>
                  {travelers.adults} Adult{travelers.adults > 1 ? "s" : ""}{" "}
                  {travelers.children.length > 0
                    ? `, ${travelers.children.length} Child${
                        travelers.children.length > 1 ? "ren" : ""
                      }`
                    : ""}
                </button>
              </div>
              <select
                className={styles.dateDropdown}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">Select a date</option>
                {tripDetails.availableDates &&
                tripDetails.availableDates.length > 0 ? (
                  tripDetails.availableDates.map((date, index) => {
                    const d_start = new Date(date);
                    const startDate = d_start.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    const d_end = new Date(d_start);
                    d_end.setDate(
                      d_start.getDate() + (tripDetails.duration - 1)
                    );
                    const endDate = d_end.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    const nights = tripDetails.duration - 1;
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
            </div>
            <div className={styles.cardInfoSection}>
              <h4 className={styles.cardInfoTitle}>
                {tripDetails.duration} days in {tripDetails.city}
              </h4>
              <div className={styles.cardCategoryChips}>
                {tripDetails.categories &&
                  tripDetails.categories.map((cat) => (
                    <span key={cat} className={styles.cardCategoryChip}>
                      <FaTag /> {cat}
                    </span>
                  ))}
              </div>
            </div>
            <div className={styles.cardFooter}>
              <p className={styles.price}>Total: {calculateTotalPrice()} PLN</p>
              <button
                className={styles.bookButton}
                onClick={handleBookNowClick}
              >
                Book for 48h
              </button>
            </div>
          </div>
        </div>
        {tripDetails.imageUrls && tripDetails.imageUrls.length > 0 && (
          <div className={styles.thumbnails}>
            {tripDetails.imageUrls.map(
              (filename, index) =>
                buildImageUrl(filename) && (
                  <div
                    key={index}
                    className={`${styles.thumbnail} ${
                      mainImage === filename ? styles.active : ""
                    }`}
                    onClick={() => setMainImage(filename)}
                  >
                    <img
                      src={buildImageUrl(filename)}
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
                      }}
                    />
                  </div>
                )
            )}
          </div>
        )}
        {isModalOpen && (
          <div className={modalStyles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Select Travelers</h3>
              <div className={styles.travelerGroup}>
                <label>Adults (12+ years):</label>
                <div className={styles.travelerControls}>
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
              <div className={styles.travelerGroup}>
                <label>Children (0–11 years):</label>
                <div className={styles.travelerControls}>
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
                <div key={index} className={styles.childBirthDate}>
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
                className={styles.modalCloseButton}
                disabled={errors.some((error) => error !== "")}
              >
                Save
              </button>
            </div>
          </div>
        )}
        <div className={styles.tripTabs}>
          <ul>
            <li onClick={() => handleScrollTo(photosRef)}>Photos</li>
            <li onClick={() => handleScrollTo(descriptionRef)}>Description</li>
            <li onClick={() => handleScrollTo(reviewsRef)}>Reviews</li>
            <li onClick={() => handleScrollTo(weatherRef)}>Weather</li>
            <li onClick={() => handleScrollTo(placesRef)}>What to do</li>
          </ul>
        </div>
      </div>
      <div className="mb-8" ref={descriptionRef}>
        <h2 className="section-heading">Trip Details</h2>
        <div className="section-content">
          <p className="detail-text">
            {tripDetails.description || sampleTripDescription}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="section-heading">Flight Details</h2>
        <div className="section-content">
          <div className={styles.flightDetailsGrid}>
            {outboundFlight && (
              <div className={styles.flightSegment}>
                <div className={styles.flightArc}>
                  <span className={styles.arcIata}>
                    {outboundFlight.departureAirportIATA}
                  </span>
                  <div className={styles.arcDate}>
                    <FaPlane />
                    <span>{formatFlightArcDate(outboundDepDate)}</span>
                  </div>
                  <span className={styles.arcIata}>
                    {outboundFlight.arrivalAirportIATA}
                  </span>
                </div>
                <div className={styles.flightTimeline}>
                  <div className={styles.timelinePoint}>
                    <FaPlaneDeparture className={styles.timelineIcon} />
                    <div className={styles.timelineInfo}>
                      <p>{formatFlightTimeline(outboundDepDate)}</p>
                      <strong>{outboundFlight.departureAirportIATA}</strong>
                    </div>
                  </div>
                  <div className={styles.timelineConnector}>
                    <span>
                      {selectedDate
                        ? calculateDuration(outboundDepDate, outboundArrDate)
                        : "N/A"}
                    </span>
                  </div>
                  <div className={styles.timelinePoint}>
                    <FaPlaneArrival className={styles.timelineIcon} />
                    <div className={styles.timelineInfo}>
                      <p>{formatFlightTimeline(outboundArrDate)}</p>
                      <strong>{outboundFlight.arrivalAirportIATA}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {returnFlight && (
              <div className={styles.flightSegment}>
                <div className={styles.flightArc}>
                  <span className={styles.arcIata}>
                    {returnFlight.departureAirportIATA}
                  </span>
                  <div className={styles.arcDate}>
                    <FaPlane />
                    <span>{formatFlightArcDate(returnDepDate)}</span>
                  </div>
                  <span className={styles.arcIata}>
                    {returnFlight.arrivalAirportIATA}
                  </span>
                </div>
                <div className={styles.flightTimeline}>
                  <div className={styles.timelinePoint}>
                    <FaPlaneDeparture className={styles.timelineIcon} />
                    <div className={styles.timelineInfo}>
                      <p>{formatFlightTimeline(returnDepDate)}</p>
                      <strong>{returnFlight.departureAirportIATA}</strong>
                    </div>
                  </div>
                  <div className={styles.timelineConnector}>
                    <span>
                      {selectedDate
                        ? calculateDuration(returnDepDate, returnArrDate)
                        : "N/A"}
                    </span>
                  </div>
                  <div className={styles.timelinePoint}>
                    <FaPlaneArrival className={styles.timelineIcon} />
                    <div className={styles.timelineInfo}>
                      <p>{formatFlightTimeline(returnArrDate)}</p>
                      <strong>{returnFlight.arrivalAirportIATA}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8" ref={weatherRef}>
        <h2 className="section-heading">Average Monthly Weather</h2>
        {monthlyWeather && monthlyWeather.length > 0 ? (
          <div className={styles.weatherChartContainer}>
            <div className={styles.weatherSwitch}>
              <span>
                {viewMode === "year"
                  ? "Średnia pogoda w ciągu roku"
                  : monthNames[selectedMonth - 1]}
              </span>
              <span
                className={styles.link}
                onClick={() =>
                  setViewMode(viewMode === "year" ? "month" : "year")
                }
              >
                {viewMode === "year" ? "Zobaczyć miesiąc" : "Zobaczyć cały rok"}
              </span>
            </div>

            {viewMode === "year" ? (
              <>
                <div className={styles.chartWrapper}>
                  <Line options={chartOptions} data={chartData} />
                </div>
                <div className={styles.monthLabels}>
                  <span></span> {/* Пустий кут */}
                  {monthLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
                <div className={styles.weatherTable}>
                  <div className={styles.weatherRow}>
                    <div className={styles.weatherRowHeader}>
                      <FaSun className={styles.weatherIcon} />
                      <span>Temperatura powietrza w ciągu dnia</span>
                    </div>
                    <div className={styles.weatherRowValues}>
                      {sortedWeather.map((m) => (
                        <span key={`temp-${m.month}`}>{m.avg_temp}°C</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.weatherRow}>
                    <div className={styles.weatherRowHeader}>
                      <FaTint className={styles.weatherIcon} />
                      <span>Precipitation</span>
                    </div>
                    <div className={styles.weatherRowValues}>
                      {sortedWeather.map((m) => (
                        <span key={`precip-${m.month}`}>
                          {m.precipitation}mm
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.monthlyWeather}>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {monthNames.map((name, i) => (
                    <option key={i} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className={styles.weatherItems}>
                  <div>
                    <FaSun className={styles.icon} />
                    Temperature on the day:{" "}
                    {sortedWeather[selectedMonth - 1]?.avg_temp}°C
                  </div>

                  <div>
                    <FaTint className={styles.icon} />
                    Precipitation:{" "}
                    {sortedWeather[selectedMonth - 1]?.precipitation ||
                      "N/A"}{" "}
                    mm
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="section-content">
            <p className="empty-section-text">
              Average monthly weather data unavailable.
            </p>
          </div>
        )}
      </div>

      <div className="mb-8" ref={placesRef}>
        <h2 className="section-heading">Places to Visit</h2>
        <div className="section-content">
          {tripDetails.placesToVisit && tripDetails.placesToVisit.length > 0 ? (
            <PlacesToVisit places={tripDetails.placesToVisit} />
          ) : (
            <p className="empty-section-text">No places listed.</p>
          )}
        </div>
      </div>
      <RecommendedHotels city={tripDetails.city} />
      <button className="book-button" onClick={handleBookNowClick}>
        Book Now
      </button>
      <div className="mb-8" ref={reviewsRef}>
        <h2 className="section-heading">Reviews & Ratings</h2>
        <div className="section-content">
          {tripReviews.length > 0 ? (
            <div className="space-y-4">
              {tripReviews.map((review) => (
                <div
                  key={review._id || review.id}
                  className={styles.reviewCard}
                >
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < review.rating
                            ? styles.starSelected
                            : styles.starUnselected
                        }
                      />
                    ))}
                  </div>
                  <p className="detail-text">
                    {review.message || review.comment}
                  </p>
                  <p className={styles.reviewUsername}>
                    By {review.username || review.user?.username || "Anonymous"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-section-text">No reviews yet.</p>
          )}
        </div>
      </div>
      {isUserAuthenticated && (
        <div className="mb-8">
          <h2 className="section-heading">Submit a Review</h2>
          <div className="section-content">
            <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
              <div>
                <label className="block detail-text mb-1">Rating:</label>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < newReviewInput.rating
                          ? `${styles.starSelected} ${styles.clickableStar}`
                          : `${styles.starUnselected} ${styles.clickableStar}`
                      }
                      onClick={() => handleStarRatingClick(i + 1)}
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
              <button type="submit" className={styles.submitReviewButton}>
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
      <FullScreenModal />
    </>
  );
};
export default TripDetails;