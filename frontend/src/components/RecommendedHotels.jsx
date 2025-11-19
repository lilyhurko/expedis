import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

import styles from "../assets/styles/RecommendedHotels.module.css"; 
import "../assets/styles/Offerts.css";
import carouselStyles from "../assets/styles/Carousel.module.css"; 

const NextArrow = ({ onClick }) => (
  <button
    className={`${carouselStyles.slickArrow} ${carouselStyles.slickArrowNext}`}
    onClick={onClick}
  >
    <FaChevronRight />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    className={`${carouselStyles.slickArrow} ${carouselStyles.slickArrowPrev}`}
    onClick={onClick}
  >
    <FaChevronLeft />
  </button>
);

const RecommendedHotels = ({ city }) => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${apiUrl}/api/hotels/search?city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch hotels (HTTP ${response.status})`);
        }

        const data = await response.json();
        setHotels(data);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, [city, apiUrl]);

  const settings = {
    dots: true,
    infinite: hotels.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    className: carouselStyles.carouselSlider, 
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className={styles.sectionHeading}>Recommended Stays in {city}</h2>
        <div className={carouselStyles.carouselContainer}>
          <p style={{ paddingLeft: "40px" }}>Loading hotels...</p>
        </div>
      </div>
    );
  }

  if (error || hotels.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className={styles.sectionHeading}>Recommended Stays in {city}</h2>

      <div className={carouselStyles.carouselContainer}>
        <Slider {...settings}>
          {hotels.map((hotel, index) => {
            const starRating = Math.round(hotel.rating / 2);

            return (
              <div key={index} className={carouselStyles.carouselSlide}>
                <div className={carouselStyles.card}>
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className={carouselStyles.cardImage}
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                    }}
                  />
              <div className={carouselStyles.cardInfo}>
                    <h4 className={styles.hotelName}>{hotel.name}</h4>
                    <div className={styles.hotelRating}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < starRating
                              ? styles.starSelected
                              : styles.starUnselected
                          }
                        />
                      ))}
                      <span style={{ marginLeft: "8px", fontSize: "0.9em" }}>
                        {hotel.rating.toFixed(1)} / 10.0
                      </span>
                    </div>
                    <a
                      href={hotel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.hotelLink}
                    >
                      Check Availability
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

RecommendedHotels.propTypes = {
  city: PropTypes.string.isRequired,
};

export default RecommendedHotels;