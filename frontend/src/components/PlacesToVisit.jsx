import React from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "../assets/styles/PlacesToVisit.module.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
const buildImageUrl = (filename) => {
  if (!filename || filename === "") {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
  }
  if (filename.startsWith("http")) {
    return filename;
  }
  return `${apiUrl}${filename}`;
};

const NextArrow = ({ onClick }) => (
  <button
    className={`${styles.slickArrow} ${styles.slickArrowNext}`}
    onClick={onClick}
  >
    <FaChevronRight />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    className={`${styles.slickArrow} ${styles.slickArrowPrev}`}
    onClick={onClick}
  >
    <FaChevronLeft />
  </button>
);

const PlacesToVisit = ({ places }) => {
  if (!places || places.length === 0) {
    return <p className="empty-section-text">No places listed.</p>;
  }

  const settings = {
    dots: true,
    infinite: places.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    className: styles.placesSlider,
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

  return (
    <div className={styles.placesCarouselContainer}>
      <Slider {...settings}>
        {places.map((place, index) => (
          <div key={place._id || index} className={styles.placeSlide}>
            <div className={styles.placeCard}>
              <img
                src={buildImageUrl(place.imageUrl)}
                alt={place.name}
                className={styles.placeImage}
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                }}
              />
              <div className={styles.placeInfo}>
                <h4 className={styles.placeName}>{place.name}</h4>

                {place.address && (
                  <p className={styles.placeAddress}>
                    {place.address}
                  </p>
                )}
                
                <p className={styles.placeDescription}>{place.description}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default PlacesToVisit;