import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import UserLayout from "./layouts/UserLayout.jsx";
import GuestLayout from "./layouts/GuestLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./components/Home.jsx";
import Trips from "./components/Trips.jsx";
import RentCar from "./components/RentCar.jsx";
import About from "./components/About.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import FeedbackPage from "./components/FeedbackPage.jsx";
import TripDetails from "./components/TripDetails.jsx";

import Profile from "./components/Profile.jsx";
import ProfileDetails from "./components/ProfileDetails.jsx";
import Wallet from "./components/Wallet.jsx";
import MyBookings from "./components/MyBookings.jsx";
import Wishlist from "./components/Wishlist.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AgencyDashboard from "./components/AgencyDashboard.jsx";

function AppWrapper() {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/offer/:offerId" element={<TripDetails />} />
        <Route path="/rent-car" element={<RentCar />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rent" element={<RentCar />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />}>
          <Route index element={<ProfileDetails />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["user", "agency", "admin"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/feedback" element={<FeedbackPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["agency", "admin"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/agency/dashboard" element={<AgencyDashboard />} />
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
