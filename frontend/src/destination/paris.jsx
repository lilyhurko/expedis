import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/DestinationPage.css'; // Стилі для сторінки
import parisImage from '../assets/img/paris.png'; // Головне фото Парижу
import paris1 from '../assets/img/paris1.jpg'; // Інші фото для каруселі
import paris2 from '../assets/img/paris2.jpg';
import paris3 from '../assets/img/paris3.jpg';
import paris4 from '../assets/img/paris4.jpg';
import paris5 from '../assets/img/paris5.jpg';
import paris6 from '../assets/img/paris6.jpg';
import paris7 from '../assets/img/paris7.jpg';
import paris8 from '../assets/img/paris8.jpg';
import paris9 from '../assets/img/paris9.jpg';
import paris10 from '../assets/img/paris10.jpg';
import paris11 from '../assets/img/paris11.jpg';
import paris12 from '../assets/img/paris12.jpg';
import paris13 from '../assets/img/paris13.jpg';
import paris14 from '../assets/img/paris14.jpg';
import paris15 from '../assets/img/paris15.jpg';
import paris16 from '../assets/img/paris16.jpg';
import paris17 from '../assets/img/paris17.jpg';
import paris18 from '../assets/img/paris18.jpg';
import paris19 from '../assets/img/paris19.jpg';
import paris20 from '../assets/img/paris20.jpg';
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


const Paris = () => {
  return (
    <div className="destination-page">
      <h2>Paris, France</h2>
      <p>The romantic capital known for the Eiffel Tower, art museums, and charming cafés.</p>
      {/* Карусель */}
      <div className="carousel-container">
        <Slider {...settings}>
          <div>
            <img src={parisImage} alt="Paris" />
          </div>
          <div>
            <img src={paris1} alt="Paris 1" />
          </div>
          <div>
            <img src={paris2} alt="Paris 2" />
          </div>
          <div>
            <img src={paris3} alt="Paris 3" />
          </div>
        </Slider>
      </div>





      {/* Бюджетна поїздка */}
      <section className="trip-section">
        <h3>Budget Trip to Paris under $500 (~2000 zł)</h3>
        <h4>Duration: <span>6 days</span></h4>
        <h4>Total Budget: <span>$450–500</span></h4>
        <h4>Concept: <span>Save on transport & accommodation, enjoy the Parisian vibe fully</span></h4>



        <h4> Transport</h4>
        <ul>
          <li>Lublin → Paris: FlixBus or BlaBlaCar (~250–300 zł round trip)</li>
          <li>Public Transport in Paris: Metro weekly pass Navigo Découverte (~110 zł)</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>Le Village Montmartre Hostel or St. Christopher's Inn (~130–180 zł/night = ~750–900 zł total)</li>
          <li><em>You can even get a room with a view of Sacré-Cœur </em></li>
        </ul>

        <h4> Food</h4>
        <ul>
          <li>Breakfasts: croissant + coffee (~10 zł)</li>
          <li>Lunches: Monoprix, street food (~25–30 zł)</li>
          <li>Dinners: One bistro (~80 zł), others cheap</li>
        </ul>
        <p>Total food budget: ~350–400 zł</p>

        <h4> Attractions & Museums</h4>
        <ul>
          <li>Free: Latin Quarter, Montmartre, Seine, Eiffel Tower (outside)</li>
          <li>Paid: Louvre (~70 zł), Versailles (~80 zł)</li>
        </ul>
        <p>Total attractions: ~150 zł</p>

        <h4> Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, Montmartre walk</li>
          <li>Day 2: Eiffel Tower, Seine, Louvre</li>
          <li>Day 3: Versailles, evening by river</li>
          <li>Day 4: Latin Quarter, Sorbonne</li>
          <li>Day 5: Thrift shopping</li>
          <li>Day 6: Café breakfast, departure</li>
        </ul>
            {/* Галерея */}
      <section className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-images">
          <img src={parisImage} alt="Paris" />
          <img src={paris4} alt="Paris 4" />
          <img src={paris5} alt="Paris 5" />
            <img src={paris6} alt="Paris 6" />
          <img src={paris7} alt="Paris 7" />
            <img src={paris8} alt="Paris 8" />
          <img src={paris9} alt="Paris 9" />
            <img src={paris10} alt="Paris 10" />
          <img src={paris11} alt="Paris 11" />
        </div>
      </section>
        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>



      {/* Люксовий тур */}
      <section className="trip-section luxury">
        <h3>  Luxury Trip to Paris — No Budget Limit</h3>
        <h4>Duration: <span>6 days</span></h4>
        <h4>Budget: <span>from 10,000 zł ($2500) — sky’s the limit</span></h4>
        <h4>Concept: <span>High-class, romantic atmosphere, elegance, and indulgence</span></h4>


        <h4> Flights</h4>
        <ul>
          <li>Warsaw → Paris (LOT): Business class ~1200–1600 zł</li>
          <li>Transfer to/from Lublin: taxi/train (~100 zł)</li>
        </ul>

        <h4> Accommodation</h4>
        <ul>
          <li>Shangri-La Paris, Le Meurice, Ritz Paris: 3000–7000 zł for 5 nights</li>
        </ul>

        <h4> Fine Dining</h4>
        <ul>
          <li>Le Jules Verne, Café de Flore, L’Avenue</li>
          <li>Tasting menus, wine, elegant desserts</li>
        </ul>
        <p>Food budget: 2000–4000 zł</p>

        <h4> Spa & Shopping</h4>
        <ul>
          <li>Spa at Ritz or Four Seasons</li>
          <li>Champs-Élysées: Dior, Chanel, Hermès</li>
          <li>Galeries Lafayette with stylist</li>
        </ul>

        <h4> Culture & Experiences</h4>
        <ul>
          <li>Private limousine/boat tours</li>
          <li>Opéra Garnier or Moulin Rouge evening</li>
          <li>Day trip to Château de Chantilly or Loire Valley</li>
        </ul>

        <h4> Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, Jules Verne dinner</li>
          <li>Day 2: Spa, Eiffel Tower, Seine cruise</li>
          <li>Day 3: Louvre, shopping, Moulin Rouge</li>
          <li>Day 4: Versailles + private guide</li>
          <li>Day 5: Montmartre + photoshoot</li>
          <li>Day 6: Coffee with Seine view, departure</li>
        </ul>
      {/* Галерея */}
      <section className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-images">
          <img src={parisImage} alt="Paris" />
          <img src={paris12} alt="Paris 12" />
          <img src={paris13} alt="Paris 13" />
            <img src={paris14} alt="Paris 14" />
          <img src={paris15} alt="Paris 15" />
            <img src={paris16} alt="Paris 16" />
            <img src={paris17} alt="Paris 17" />
            <img src={paris18} alt="Paris 18" />
            <img src={paris19} alt="Paris 19" />
          <img src={paris20} alt="Paris 20" />
        </div>
      </section>
        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>
    </div>
    
  );
};

export default Paris;
