import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import UserLayout from './layouts/UserLayout.jsx';
import GuestLayout from './layouts/GuestLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';


import Home from './components/Home.jsx';
import Offerts from './components/Offerts.jsx';
import About from './components/About.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Profile from './components/Profile.jsx';
import FeedbackPage from './components/FeedbackPage.jsx';

import Paris from './destination/paris.jsx';
import NewYork from './destination/newyork.jsx';
import Tokyo from './destination/tokyo.jsx';
import Bali from './destination/bali.jsx';
import Dubai from './destination/dubai.jsx';


function AppWrapper() {
  return (
    <Routes>
      {/* Публічні сторінки в GuestLayout */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/offerts" element={<Offerts />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/destination/paris" element={<Paris />} />
        <Route path="/destination/newyork" element={<NewYork />} />
        <Route path="/destination/tokyo" element={<Tokyo />} />
        <Route path="/destination/bali" element={<Bali />} />
        <Route path="/destination/dubai" element={<Dubai />} />
      </Route>
      
      {/* Захищені сторінки в UserLayout */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/offerts" element={<Offerts />} />
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
