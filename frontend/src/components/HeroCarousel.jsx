import React from "react";
import { Carousel, Button } from "react-bootstrap";
import "../assets/styles/HeroCarousel.css";
import backgroundImage from "../assets/img/background-image.jpg"; // Підключення фонової картинки
const HeroCarousel = () => {
  return (
    <div
      className="hero-carousel-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <Carousel controls={false} indicators={false} fade>
        {/* Slide 1 */}
        <Carousel.Item>
          <div className="carousel-card">
            <h3>Flight Search</h3>
            <p>
              Find the best flight deals in just a few clicks. Compare prices and book your
              next adventure effortlessly!
            </p>
          </div>
        </Carousel.Item>

        {/* Slide 2 */}
        <Carousel.Item>
          <div className="carousel-card">
            <h3>Accommodation</h3>
            <p>
              Discover the perfect stay! From budget-friendly hostels to luxury resorts—
              your dream accommodation awaits.
            </p>
          </div>
        </Carousel.Item>

       <Carousel.Item>
          <div className="carousel-card">
            <h3>Weather Forecast</h3>
            <p>
             Plan your trip with confidence! Get real-time weather updates for your destination.
            </p>
          </div>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
