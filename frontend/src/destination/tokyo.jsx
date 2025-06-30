import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/DestinationPage.css'; // Стилі для сторінки
import tokyo1 from '../assets/img/tokyo1.jpg';
import tokyo2 from '../assets/img/tokyo2.jpg';
import tokyo3 from '../assets/img/tokyo3.jpg';
import tokyo4 from '../assets/img/tokyo4.jpg';
import tokyo5 from '../assets/img/tokyo5.jpg';
import tokyo6 from '../assets/img/tokyo6.jpg';
import tokyo7 from '../assets/img/tokyo7.jpg';
import tokyo8 from '../assets/img/tokyo8.jpg';
import tokyo9 from '../assets/img/tokyo9.jpg';
import tokyo10 from '../assets/img/tokyo10.jpg';
import tokyo11 from '../assets/img/tokyo11.jpg';
import tokyo12 from '../assets/img/tokyo12.jpg';
import tokyo13 from '../assets/img/tokyo13.jpg';
import tokyo14 from '../assets/img/tokyo14.jpg';
import tokyo15 from '../assets/img/tokyo15.jpg';
import tokyo16 from '../assets/img/tokyo16.jpg';
import tokyo17 from '../assets/img/tokyo17.jpg';
import tokyo18 from '../assets/img/tokyo18.jpg';
import tokyo19 from '../assets/img/tokyo19.jpg';
import tokyo20 from '../assets/img/tokyo20.jpg';
import tokyo21 from '../assets/img/tokyo21.jpg';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
};

const Tokyo = () => {
  return (
    <div className="destination-page">
      <h2>Tokyo, Japan</h2>
      <p>Where futuristic innovation meets centuries-old tradition. A city of lights, temples, and endless surprises!</p>

      {/* Карусель */}
      <div className="carousel-container">
        <Slider {...settings}>
          <div>
            <img src={tokyo1} alt="Tokyo 1" />
          </div>
          <div>
            <img src={tokyo2} alt="Tokyo 2" />
          </div>
          <div>
            <img src={tokyo3} alt="Tokyo 3" />
          </div>
          <div>
            <img src={tokyo4} alt="Tokyo 4" />
          </div>
        </Slider>
      </div>

      {/* Бюджетна поїздка */}
      <section className="trip-section">
        <h3>Budget Trip to Tokyo – Up to $500 (~2000 zł)</h3>
        <h4>Duration: <span>6 days</span></h4>
        <h4>Total Budget: <span>~$500 (excluding international flight)</span></h4>
        <h4>Style: <span>budget-smart, cultural immersion, modern meets traditional</span></h4>

        <h4>Flight</h4>
        <ul>
          <li>Warsaw → Tokyo: ~$700–1000 round-trip (not included in $500 budget)</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>Capsule hotels or guesthouses like Grids Tokyo Asakusa, Nine Hours Shinjuku (~$30–50/night = ~$180–250 total)</li>
        </ul>

        <h4>Transportation</h4>
        <ul>
          <li>Suica/Pasmo prepaid metro card (~$30 for 6 days)</li>
          <li>Walking through unique neighborhoods</li>
        </ul>

        <h4>Food</h4>
        <ul>
          <li>Breakfast/Lunch: Combini meals (7-Eleven, Lawson) (~$3–6)</li>
          <li>Dinner: Conveyor belt sushi, ramen (~$8–12)</li>
        </ul>
        <p>Total food budget: ~$100</p>

        <h4>Activities & Attractions</h4>
        <ul>
          <li>Free: Senso-ji Temple, Meiji Shrine, Shibuya Crossing</li>
          <li>Low-cost: TeamLab Planets ($30), Skytree observation deck (~$20)</li>
        </ul>

        <h4>Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, Shibuya and Harajuku exploration</li>
          <li>Day 2: Asakusa, Senso-ji Temple</li>
          <li>Day 3: TeamLab Planets and Odaiba</li>
          <li>Day 4: Shinjuku Gyoen Park, shopping in Shinjuku</li>
          <li>Day 5: Tsukiji Outer Market food tour</li>
          <li>Day 6: Last stroll, souvenirs, departure</li>
        </ul>

        {/* Галерея */}
        <section className="gallery">
          <h3>Gallery</h3>
          <div className="gallery-images">
            <img src={tokyo5} alt="Tokyo 5" />
            <img src={tokyo6} alt="Tokyo 6" />
            <img src={tokyo7} alt="Tokyo 7" />
            <img src={tokyo8} alt="Tokyo 8" />
            <img src={tokyo9} alt="Tokyo 9" />
            <img src={tokyo10} alt="Tokyo 10" />
            <img src={tokyo11} alt="Tokyo 11" />
            <img src={tokyo12} alt="Tokyo 12" />
          </div>
        </section>

        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>

      {/* Люксовий тур */}
      <section className="trip-section luxury">
        <h3>Luxury Trip to Tokyo — No Budget Limit</h3>
        <h4>Duration: <span>6 days</span></h4>
        <h4>Budget: <span>from 15,000 zł ($3500) — sky’s the limit</span></h4>
        <h4>Concept: <span>Ultra-luxury, fine dining, private experiences</span></h4>

        <h4>Flights</h4>
        <ul>
          <li>Business class Warsaw → Tokyo on ANA or LOT</li>
          <li>Private transfer from airport</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>The Peninsula Tokyo, Aman Tokyo, Park Hyatt Tokyo</li>
          <li>Price range: 7000–15000 zł for 5 nights</li>
        </ul>

        <h4>Fine Dining</h4>
        <ul>
          <li>Michelin-starred restaurants: Narisawa, Sukiyabashi Jiro</li>
          <li>Exclusive omakase sushi dinners</li>
        </ul>

        <h4>Shopping</h4>
        <ul>
          <li>Luxury boutiques in Ginza: Chanel, Dior, Mikimoto</li>
          <li>Personal shopping services</li>
        </ul>

        <h4>Culture & Experiences</h4>
        <ul>
          <li>Private tea ceremony experience</li>
          <li>Helicopter tour over Tokyo Bay</li>
          <li>Day trips to Mount Fuji with private guide</li>
        </ul>

        <h4>Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, fine dining dinner</li>
          <li>Day 2: Helicopter tour, Ginza shopping</li>
          <li>Day 3: Private tea ceremony, Meiji Shrine VIP tour</li>
          <li>Day 4: Day trip to Mount Fuji</li>
          <li>Day 5: Museums and Roppongi Hills evening</li>
          <li>Day 6: Relaxation at luxury spa, departure</li>
        </ul>

        {/* Галерея */}
        <section className="gallery">
          <h3>Gallery</h3>
          <div className="gallery-images">
            <img src={tokyo13} alt="Tokyo 13" />
            <img src={tokyo14} alt="Tokyo 14" />
            <img src={tokyo15} alt="Tokyo 15" />
            <img src={tokyo16} alt="Tokyo 16" />
            <img src={tokyo17} alt="Tokyo 17" />  
            <img src={tokyo18} alt="Tokyo 18" />
            <img src={tokyo19} alt="Tokyo 19" />
            <img src={tokyo20} alt="Tokyo 20" />
            <img src={tokyo21} alt="Tokyo 21" />


          </div>
        </section>

        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>
    </div>
  );
};

export default Tokyo;
