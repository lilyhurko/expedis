import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import UserLayout from './layouts/UserLayout.jsx';
import GuestLayout from './layouts/GuestLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './components/Home.jsx';
import Trips from './components/Trips.jsx';
import RentCar from './components/RentCar.jsx';
import About from './components/About.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Profile from './components/Profile.jsx';
import FeedbackPage from './components/FeedbackPage.jsx';
import TripDetails from './components/TripDetails.jsx';
import MyBookings from './components/MyBookings.jsx';

function AppWrapper() {
  return (
    <Routes>
      {/* Public pages in GuestLayout */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/offer/:offerId" element={<TripDetails />} />
        <Route path="/rent-car" element={<RentCar />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Protected pages in UserLayout */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;