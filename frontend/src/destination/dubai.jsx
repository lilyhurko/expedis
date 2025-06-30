import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/DestinationPage.css'; 
import dubai1 from '../assets/img/dubai1.jpg';
import dubai2 from '../assets/img/dubai2.jpg';
import dubai3 from '../assets/img/dubai3.jpg';
import dubai4 from '../assets/img/dubai4.jpg';
import dubai5 from '../assets/img/dubai5.jpg';
import dubai6 from '../assets/img/dubai6.jpg';
import dubai7 from '../assets/img/dubai7.jpg';
import dubai8 from '../assets/img/dubai8.jpg';
import dubai9 from '../assets/img/dubai9.jpg';
import dubai10 from '../assets/img/dubai10.jpg';
import dubai11 from '../assets/img/dubai11.jpg';
import dubai12 from '../assets/img/dubai12.jpg';
import dubai13 from '../assets/img/dubai13.jpg';
import dubai14 from '../assets/img/dubai14.jpg';
import dubai15 from '../assets/img/dubai15.jpg';
import dubai16 from '../assets/img/dubai16.jpg';
import dubai17 from '../assets/img/dubai17.jpg';
import dubai18 from '../assets/img/dubai18.jpg';
import dubai19 from '../assets/img/dubai19.jpg';
import dubai20 from '../assets/img/dubai20.jpg';
import dubai21 from '../assets/img/dubai21.jpg';
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

const Dubai = () => {
  return (
    <div className="destination-page">
      <h2>DUBAI, UAE</h2>
      <p>The ultimate city of innovation, luxury, and desert beauty.</p>
      <div className="carousel-container">
        <Slider {...settings}>
          <div>
            <img src={dubai4} alt="Dubai 4" />
          </div>
          <div>
            <img src={dubai1} alt="Dubai 1" />
          </div>
          <div>
            <img src={dubai2} alt="Dubai 2" />
          </div>
          <div>
            <img src={dubai3} alt="Dubai 3" />
          </div>
        </Slider>
      </div>

      <section className="trip-section">
        <h3>Budget Trip – Up to $500 (~2000 PLN)</h3>
        <h4>Duration: 5–6 days</h4>
        <h4>Total Budget: ~$500 (excluding flights)</h4>
        <h4>Style: city vibes, desert views, Insta-worthy without overspending</h4>

        <h4>Flights</h4>
        <ul>
          <li>Warsaw → Dubai (WizzAir, LOT): ~$250–400 return (not included in $500)</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>Budget hotels in Deira or Bur Dubai (~$30–50/night)</li>
        </ul>
        <p>Total: ~$150–200 for 5 nights</p>

        <h4>Food</h4>
        <ul>
          <li>Local eateries and food courts (~$5–10 per meal)</li>
        </ul>
        <p>Total: ~$100–150</p>

        <h4>Transport</h4>
        <ul>
          <li>Metro card (NOL card) for easy transport (~$20)</li>
        </ul>

        <h4>Attractions & Activities</h4>
        <ul>
          <li>Burj Khalifa (outside view)</li>
          <li>Dubai Mall, Dubai Fountain show</li>
          <li>Desert Safari (budget version ~$30–50)</li>
        </ul>
        <p>Total: ~$50–80</p>

        <h4>Suggested Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, check-in, explore local souks</li>
          <li>Day 2: Dubai Mall, Burj Khalifa area</li>
          <li>Day 3: Desert safari</li>
          <li>Day 4: Beach day at JBR</li>
          <li>Day 5: Old Dubai (Al Fahidi, Gold Souk)</li>
          <li>Day 6: Departure</li>
        </ul>

        <section className="gallery">
          <h3>Gallery</h3>
          <div className="gallery-images">
            <img src={dubai21} alt="Dubai 21" />
            <img src={dubai5} alt="Dubai 5" />
            <img src={dubai6} alt="Dubai 6" />
            <img src={dubai7} alt="Dubai 7" />
            <img src={dubai8} alt="Dubai 8" />
            <img src={dubai9} alt="Dubai 9" />
            <img src={dubai10} alt="Dubai 10" />
            <img src={dubai11} alt="Dubai 11" />
          </div>
        </section>

        <Link to="/login">
          <button className="book-now-button">Book Now</button>
        </Link>
      </section>

      <section className="trip-section luxury">
        <h3>Luxury Trip – No Budget Limit</h3>
        <h4>Duration: 5–6 days</h4>
        <h4>Budget: from $3000 and up</h4>
        <h4>Style: 5-star hotels, fine dining, private experiences</h4>

        <h4>Flights</h4>
        <ul>
          <li>Warsaw → Dubai: business class (~$2000–3000)</li>
        </ul>

        <h4>Accommodation</h4>
        <ul>
          <li>Burj Al Arab, Atlantis The Palm, Armani Hotel (~$500–800/night)</li>
        </ul>
        <p>Total: ~$3000–4000</p>

        <h4>Dining</h4>
        <ul>
          <li>High-end restaurants: Zuma, Atmosphere, Pierchic</li>
          <li>Average meal: $100–200</li>
        </ul>
        <p>Total: ~$1000–1500</p>

        <h4>Activities</h4>
        <ul>
          <li>Private yacht tour, luxury desert safari, helicopter ride</li>
        </ul>
        <p>Total: ~$1500–2000</p>

        <h4>Sample Itinerary</h4>
        <ul>
          <li>Day 1: Arrival, spa, Burj Khalifa observation deck</li>
          <li>Day 2: Private yacht tour</li>
          <li>Day 3: Desert safari with private guide</li>
          <li>Day 4: Fine dining and shopping</li>
          <li>Day 5: Helicopter ride, relaxation</li>
          <li>Day 6: Departure</li>
        </ul>
      </section>

      <section className="gallery">
        <h3>Gallery</h3>
        <div className="gallery-images">
          <img src={dubai12} alt="Dubai 12" />
          <img src={dubai13} alt="Dubai 13" />
          <img src={dubai14} alt="Dubai 14" />
          <img src={dubai15} alt="Dubai 15" />
          <img src={dubai16} alt="Dubai 16" />
          <img src={dubai17} alt="Dubai 17" />
          <img src={dubai18} alt="Dubai 18" />
          <img src={dubai19} alt="Dubai 19" />
          <img src={dubai20} alt="Dubai 20" />
        </div>
      </section>

      <Link to="/login">
        <button className="book-now-button">Book Now</button>
      </Link>
    </div>
  );
};

export default Dubai;
