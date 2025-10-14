import React, { useState, useEffect } from 'react';
import '../assets/styles/Testimonials.css';
import userIcon from '../assets/img/user.png';
import axios from 'axios';

const Testimonials = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; 
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/comments`);
        const latestComments = response.data.slice(0, 2);
        setComments(latestComments);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load testimonials. Please try again later.');
      }
    };

    fetchComments();
  }, [apiUrl]); 

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (comments.length === 0) {
    return <p>Loading testimonials...</p>; 
  }

  return (
    <section className="testimonials-section">
      <h2 className="section-heading">Testimonials</h2>
      <div className="testimonials-container">

        <div className="testimonials-box">
          <h2>
            <span className="blue-text">Don’t just take our word for it,</span>
            <span className="gray-text">see what our users say!</span>
          </h2>
          <p>
            Discover what our customers have to say about their experience with our service.
            Read real reviews from satisfied users and get inspired by their stories.
          </p>
        </div>

        <div className="testimonials-right">
          {comments.map(({ _id, message, username }) => (
            <div key={_id} className="testimonial-card">
              <p>{message}</p>
              <div className="testimonial-user">
                <img src={userIcon} alt="User" className="user-icon" />
                <div>
                  <strong>{username}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;