import React, { useState } from 'react';
import '../assets/styles/Auth.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
      });

      if (response.data && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        alert('Login successful!');

        const savedOfferId = localStorage.getItem('selectedOffer');
        if (savedOfferId) {
          localStorage.removeItem('selectedOffer');
          navigate(`/offerts`); 
        } else {
          navigate('/profile');
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="form-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="button-wrapper">
          <button className="form-button" type="submit">LogIn</button>
        </div>
      </form>
      <div className="form-footer">
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
}

export default Login;
