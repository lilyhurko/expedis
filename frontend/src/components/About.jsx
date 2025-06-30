import React, { useState, useEffect } from 'react';
import '../assets/styles/About.css';

const About = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/comments') 
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => setComments(data))
      .catch((error) => console.error('Error fetching comments:', error));
  }, []);

  return (
    <div className="about-us-page">
      <section className="about-us">
        <div className="container">
          <h2 className="about-us-title">About Us</h2>
          <p>
            Once upon a time, two students, Lilia and Ivanka, were sitting in a cozy café on a rainy evening in the heart of Lublin. As they sipped their hot cocoa with marshmallows, they exchanged stories of their dreams and the adventures they wanted to embark on. 
            "What if we created a website where people can find their dream vacation?" Lilia said, her eyes sparkling.
            "Yes! A place where everyone can find not just a trip, but an unforgettable experience," Ivanka replied, nodding enthusiastically.
            And that's how our little project was born. We are computer science students, combining our love for coding with a passion for adventure. We hope to inspire people to chase their dreams and create beautiful memories. Thank you for being part of this journey with us! 
          </p>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-heading">Traveler Comments</h2>
          <div id="comments" className="testimonials-container">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div className="testimonial-card" key={comment._id}>
                  <p>{comment.message}</p>
                  <div className="testimonial-user">
                    <div className="user-icon"></div>
                    <span>{comment.username}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
