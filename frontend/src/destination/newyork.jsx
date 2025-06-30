import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/DestinationPage.css'; // Стилі для сторінки
import newyork1 from '../assets/img/newyork1.jpg';
import newyork2 from '../assets/img/newyork2.jpg';
import newyork3 from '../assets/img/newyork3.jpg';
import newyork4 from '../assets/img/newyork4.jpg';
import newyork5 from '../assets/img/newyork5.jpg';
import newyork6 from '../assets/img/newyork6.jpg';
import newyork7 from '../assets/img/newyork7.jpg';
import newyork8 from '../assets/img/newyork8.jpg';
import newyork9 from '../assets/img/newyork9.jpg';
import newyork10 from '../assets/img/newyork10.jpg';
import newyork11 from '../assets/img/newyork11.jpg';
import newyork12 from '../assets/img/newyork12.jpg';
import newyork13 from '../assets/img/newyork13.jpg';
import newyork14 from '../assets/img/newyork14.jpg';
import newyork15 from '../assets/img/newyork15.jpg';
import newyork16 from '../assets/img/newyork16.jpg';
import newyork17 from '../assets/img/newyork17.jpg';
import newyork18 from '../assets/img/newyork18.jpg';
import newyork19 from '../assets/img/newyork19.jpg';
import newyork20 from '../assets/img/newyork20.jpg';
import newyork21 from '../assets/img/newyork21.jpg';

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

const NewYork = () => {
  return (
    <div className="destination-page">
      <h2>New York City, USA</h2>
      <p>The city that never sleeps, famous for its skyscrapers, culture, and vibrant energy.</p>

      {/* Карусель */}
      <div className="carousel-container">
        <Slider {...settings}>
          <div>
            <img src={newyork4} alt="New York 4" />
          </div>
          <div>
            <img src={newyork1} alt="New York 1" />
          </div>
          <div>
            <img src={newyork2} alt="New York 2" />
          </div>
          <div>
            <img src={newyork3} alt="New York 3" />
          </div>
        </Slider>
      </div>

      {/* Бюджетна поїздка */}
      <section className="trip-section">
        <h3>Budget Trip to New York City – Up to $500 (~2000 zł)</h3>
        <h4>Duration: <span>6 days</span></h4>
        <h4>Total Budget: <span>~$500 (excluding international flight)</span></h4>
        <h4>Style: <span>save smartly but still feel the NYC magic</span></h4>

        <h4>Flight</h4>
        <ul>
          <li>Warsaw → New York (JFK): round-trip with budget airlines, booked early = ~$400–600 (not included in $500 budget)</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>Budget-friendly hostels or Airbnb in Brooklyn or Queens</li>
          <li>The Local NYC Hostel, Q4 Hotel (~$50–70/night = ~$300–350 total)</li>
        </ul>

        <h4>Transportation</h4>
        <ul>
          <li>7-day Unlimited MetroCard = ~$34</li>
          <li>Walking a lot — NYC is best on foot!</li>
        </ul>

        <h4>Food</h4>
        <ul>
          <li>Breakfast: bagels, coffee carts ($2–4)</li>
          <li>Lunch: pizza slices, delis, food trucks ($5–10)</li>
          <li>Dinner: casual diners or ramen spots ($10–15)</li>
        </ul>
        <p>Total food budget: ~$100</p>

        <h4>Activities & Attractions</h4>
        <ul>
          <li>Free: Central Park, Brooklyn Bridge walk, Times Square, Wall Street, 9/11 Memorial (outdoor)</li>
          <li>Low-cost: Top of the Rock ($40), ferry to Staten Island (free)</li>
        </ul>

        <h4>Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, Times Square walk</li>
          <li>Day 2: Central Park, Museum of Modern Art (free Friday evenings)</li>
          <li>Day 3: Brooklyn Bridge, DUMBO area</li>
          <li>Day 4: Statue of Liberty view from ferry</li>
          <li>Day 5: Wall Street, World Trade Center</li>
          <li>Day 6: Last breakfast, departure</li>
        </ul>

        {/* Галерея */}
        <section className="gallery">
          <h3>Gallery</h3>
          <div className="gallery-images">
            <img src={newyork21} alt="New York 21" />
            <img src={newyork5} alt="New York 5" />
            <img src={newyork6} alt="New York 6" />
            <img src={newyork7} alt="New York 7" />
            <img src={newyork8} alt="New York 8" />
            <img src={newyork9} alt="New York 9" />
            <img src={newyork10} alt="New York 10" />
            <img src={newyork11} alt="New York 11" />
          </div>
        </section>

        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>

      {/* Люксовий тур */}
      <section className="trip-section luxury">
        <h3>Luxury Trip to New York City — No Budget Limit</h3>
        <h4>Duration: <span>6 days</span></h4>
        <h4>Budget: <span>from 15,000 zł ($3500) — sky’s the limit</span></h4>
        <h4>Concept: <span>Luxury, exclusivity, world-class experiences</span></h4>

        <h4>Flights</h4>
        <ul>
          <li>Business class Warsaw → New York (LOT or other premium airlines)</li>
          <li>Transfers: Private car service from airport</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>Hotels like The Plaza, The Ritz-Carlton, The St. Regis</li>
          <li>Price range: 7000–15000 zł for 5 nights</li>
        </ul>

        <h4>Fine Dining</h4>
        <ul>
          <li>Eleven Madison Park, Le Bernardin, Nobu Downtown</li>
          <li>Michelin-star tasting menus and exclusive rooftop cocktails</li>
        </ul>

        <h4>Shopping</h4>
        <ul>
          <li>5th Avenue boutiques: Tiffany, Cartier, Bergdorf Goodman</li>
          <li>Personal shopper experiences</li>
        </ul>

        <h4>Culture & Experiences</h4>
        <ul>
          <li>Private helicopter tour over Manhattan</li>
          <li>Broadway VIP tickets and backstage tours</li>
          <li>Day trips to the Hamptons or Hudson Valley wineries</li>
        </ul>

        <h4>Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, evening rooftop dinner</li>
          <li>Day 2: Helicopter tour, Central Park carriage ride</li>
          <li>Day 3: Museums and private gallery visits</li>
          <li>Day 4: Shopping spree with stylist</li>
          <li>Day 5: Broadway show, fine dining</li>
          <li>Day 6: Leisure morning, departure</li>
        </ul>

        {/* Галерея */}
        <section className="gallery">
          <h3>Gallery</h3>
          <div className="gallery-images">
            <img src={newyork12} alt="New York 12" />
            <img src={newyork13} alt="New York 13" />
            <img src={newyork14} alt="New York 14" />
            <img src={newyork15} alt="New York 15" />
            <img src={newyork16} alt="New York 16" />
            <img src={newyork17} alt="New York 17" />
            <img src={newyork18} alt="New York 18" />
            <img src={newyork19} alt="New York 19" />
            <img src={newyork20} alt="New York 20" />
          </div>
        </section>

        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>
    </div>
  );
};

export default NewYork;
