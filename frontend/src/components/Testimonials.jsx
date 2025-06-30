import React from "react";
import "../assets/styles/Testimonials.css";
import { Link } from "react-router-dom";
import userIcon from "../assets/img/user.png";

const Testimonials = () => {
  return (
    
    <section className="testimonials-section">
      <h2 className="section-heading">Testimonials</h2>
      <div className="testimonials-container">

    <div className="testimonials-box">
      <h2>
      <span className="blue-text">Don’t just take our world for it,</span>
      <span className="gray-text">see what our users say!</span>
      </h2>

      <p>
        Discover what our customers have to say about their experience with our service.
        Read real reviews from satisfied users and get inspired by their stories.
      </p>
      <Link to="/about" className="view-all-button">View all</Link>
    </div>

    <div className="testimonials-right">
      <div className="testimonial-card">
        <p>
          Expedis made my trip planning so easy! I found the best flight and hotel
          deals in just a few clicks. The expert reviews helped me choose the perfect
          destination, and the personalized recommendations saved me a lot of time.
          I’ll definitely use Expedis again for my next vacation!
        </p>

        <div className="testimonial-user">
          <img src={userIcon} alt="User" className="user-icon" />
          <div>
            <strong>Emma, 28</strong><br />
            <span>United Kingdom</span>
          </div>
        </div>
      </div>

      <div className="testimonial-card">
        <p>
          I usually spend hours searching for flights and accommodations, but with
          Expedis, everything was in one place. The booking process was seamless,
          and I loved reading travel blogs from experts. Thanks to Expedis, my trip
          was stress-free and well-organized. Highly recommend!
        </p>
            <div className="testimonial-user">
                  <img src={userIcon} alt="User" className="user-icon" />
                  <div>
          <strong>Lucas, 35</strong><br />
          <span>Germany</span>
        </div>
      </div>

      </div>
    </div>
  </div>
</section>
  );
};

export default Testimonials;
