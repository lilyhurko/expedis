import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/DestinationPage.css'; 
import bali1 from '../assets/img/bali1.jpg'; 
import bali2 from '../assets/img/bali2.jpg';
import bali3 from '../assets/img/bali3.jpg';
import bali4 from '../assets/img/bali4.jpg';
import bali5 from '../assets/img/bali5.jpg';
import bali6 from '../assets/img/bali6.jpg';
import bali7 from '../assets/img/bali7.jpg';
import bali8 from '../assets/img/bali8.jpg';
import bali9 from '../assets/img/bali9.jpg';
import bali10 from '../assets/img/bali10.jpg';
import bali11 from '../assets/img/bali11.jpg';
import bali12 from '../assets/img/bali12.jpg';
import bali13 from '../assets/img/bali13.jpg';
import bali14 from '../assets/img/bali14.jpg';
import bali15 from '../assets/img/bali15.jpg';
import bali16 from '../assets/img/bali16.jpg';
import bali17 from '../assets/img/bali17.jpg';
import bali18 from '../assets/img/bali18.jpg';
import bali19 from '../assets/img/bali19.jpg';
import bali20 from '../assets/img/bali20.jpg';
import bali21 from '../assets/img/bali21.jpg';
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


const Bali = () => {
  return (
    <div className="destination-page">
      <h2>Bali, Indonesia</h2>
      <p>The tropical paradise known for its beaches, temples, and vibrant culture.</p>
      {/* Carousel */}
      <div className="carousel-container">
        <Slider {...settings}>
          <div>
            <img src={bali21} alt="Bali 21" />
          </div>
          <div>
            <img src={bali1} alt="Bali 1" />
          </div>
          <div>
            <img src={bali2} alt="Bali 2" />
          </div>
          <div>
            <img src={bali3} alt="Bali 3" />
          </div>
        </Slider>
      </div>

      {/* Budget Trip */}
      <section className="trip-section">
        <h3>Budget Trip to Bali – up to $500 (~2000 PLN)</h3>
        <h4>Duration: 6–7 days</h4>
        <h4>Total Budget: ~$500 (excluding flights)</h4>
        <h4>Style: saving on accommodation and food while keeping the Bali vibe</h4>

        <h4>Flights</h4>
        <ul>
          <li>Warsaw → Denpasar: budget airlines with layovers (~$700–900 round-trip if booked early)</li>
          <li>Hotel transfer: taxi or shared transfer (~$10–20)</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>Hostels or budget guesthouses in Kuta, Ubud, or Canggu (~$15–25/night)</li>
        </ul>
        <p>Total: ~$100–150 for 6 nights</p>

        <h4>Food</h4>
        <ul>
          <li>Breakfasts: included or street food (~$2–3)</li>
          <li>Lunch and dinner: local warungs (~$3–5 per meal)</li>
        </ul>
        <p>Total: ~$100–120</p>

        <h4>Transport</h4>
        <ul>
          <li>Scooter rental: ~$5–7/day</li>
          <li>Or use Gojek / Grab apps for transport</li>
        </ul>
        <p>Total: ~$40–50</p>

        <h4>Attractions & Activities</h4>
        <ul>
          <li>Visit temples like Tanah Lot, Uluwatu</li>
          <li>Walk through Tegalalang Rice Terraces</li>
          <li>Beach time at Seminyak or Nusa Dua</li>
        </ul>
        <p>Entry tickets: ~$2–5 per site</p>
        <p>Total: ~$50–60</p>

        <h4>Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, check-in, evening walk</li>
          <li>Day 2: Uluwatu Temple, beach day</li>
          <li>Day 3: Tegalalang Rice Terraces, Tirta Empul temple</li>
          <li>Day 4: Beach at Seminyak, night market</li>
          <li>Day 5: Day trip to Nusa Penida or Mount Batur</li>
          <li>Day 6: Shopping in Ubud, explore cafes</li>
          <li>Day 7: Departure</li>
        </ul>
             <section className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-images">
          <img src={bali4} alt="Bali 4" />
          <img src={bali5} alt="Bali 5" />
          <img src={bali6} alt="Bali 6" />
          <img src={bali7} alt="Bali 7" />
          <img src={bali8} alt="Bali 8" />
          <img src={bali9} alt="Bali 9" />
          <img src={bali10} alt="Bali 10" />
          <img src={bali11} alt="Bali 11" />
          
        </div>
      </section>
        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>

 
      {/* Luxury Trip */}
<section className="trip-section luxury">
  <h3>Luxury Trip to Bali – No Budget Limit</h3>
  <h4>Duration: 6–7 days</h4>
  <h4>Budget: from $3000 and up</h4>
  <h4>Style: luxurious villas, private tours, spa treatments, fine dining</h4>

  <h4>Flights</h4>
  <ul>
    <li>Warsaw → Denpasar: business class with few layovers (~$2000–3000 round-trip)</li>
    <li>Private transfer to hotel: included or ~$50–100</li>
  </ul>

  <h4>Accommodation</h4>
  <ul>
    <li>5-star hotels or private villas: Viceroy Bali, COMO Shambhala Estate, Four Seasons Sayan</li>
    <li>Rate: from $500/night</li>
    <li>Total: ~$3000–3500 for 6 nights</li>
  </ul>

  <h4>Dining</h4>
  <ul>
    <li>High-end restaurants: Apéritif Restaurant & Bar, Mozaic Gastronomic Restaurant, Sundara Beach Club</li>
    <li>Average bill: $50–150 per meal</li>
    <li>Total: ~$1000–1500</li>
  </ul>

  <h4>Wellness & Relaxation</h4>
  <ul>
    <li>Spa treatments at COMO Shambhala or Akoya Spa</li>
    <li>Yoga sessions, meditation, Ayurveda</li>
    <li>Cost: ~$100–300 per session</li>
    <li>Total: ~$500–1000</li>
  </ul>

  <h4>Transport & Excursions</h4>
  <ul>
    <li>Private driver for full stay</li>
    <li>Private tours to Nusa Penida, Mount Batur, Besakih Temple</li>
    <li>Total: ~$500–800</li>
  </ul>

  <h4>Extra Activities</h4>
  <ul>
    <li>Private beach dinner</li>
    <li>Yacht cruise</li>
    <li>Surfing lessons with a coach</li>
    <li>Total: ~$500–1000</li>
  </ul>

  <h4>Sample Itinerary</h4>
  <ul>
    <li>Day 1: Arrival, hotel check-in, spa session</li>
    <li>Day 2: Besakih Temple, dinner at Apéritif</li>
    <li>Day 3: Day trip to Nusa Penida, beach time</li>
    <li>Day 4: Hike Mount Batur, breakfast with a view</li>
    <li>Day 5: Visit Ubud, shopping, cooking class</li>
    <li>Day 6: Yacht cruise, romantic beach dinner</li>
    <li>Day 7: Departure</li>
  </ul>
</section>

      {/* Gallery */}
      <section className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-images">
          <img src={bali12} alt="Bali 12" />
          <img src={bali13} alt="Bali 13" />
          <img src={bali14} alt="Bali 14" />
          <img src={bali15} alt="Bali 15" />
          <img src={bali16} alt="Bali 16" />
          <img src={bali17} alt="Bali 17" />
          <img src={bali18} alt="Bali 18" />
          <img src={bali19} alt="Bali 19" />
          <img src={bali20} alt="Bali 20" />
        </div>
      </section>
              <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
    </div>
  );
};
export default Bali;
