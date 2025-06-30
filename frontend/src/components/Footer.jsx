import React from "react";
import "../assets/styles/Footer.css"; 
import koloImg from "../assets/img/kolo.png";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Section with line and 'Being Your Journey' */}
      <div className="footer-heading">
        <div className="line"></div>
        <h2>Being Your Journey</h2>
      </div>

      {/* Section with 'Let’s Just Get Travel' text and image */}
            <div className="footer-center">
              <h2 className="footer-heading-text">
                Let’s just get a travel<br />
                Ar<img src={koloImg} alt="Kolo" className="footer-image-kolo" />und the world
              </h2>
             </div>
            <div className="footer-cta">
              <p className="footer-cta-text">
              Ready to turn your travel dreams into reality?<br />
              Get in touch with us today and let's start planning your next adventure.
            </p>
             <a href="/login" className="footer-cta-button">
                Join the Trip
              </a>
            </div>

    

      {/* Footer content */}
      <div className="footer-content">
        <div>
          <div className="footer-subtext">Get touch with us</div>
          <div className="footer-email">contact@expedis.travel</div>
          <div className="footer-title">Expedis</div>
        </div>

        <div className="footer-right">
          Lublin,<br />
          ul. Nadbystrzycka 39<br />
          (+48) 123-456-789
        </div>
      </div>

      {/* Footer bottom */}
      <div className="footer-bottom">
        <div>© 2025 Expedis. All rights reserved.</div>
        <div className="footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
