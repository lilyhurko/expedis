import React, { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar.jsx";
import Navbar from "../components/Navbar.jsx";
import CarrentCard from "../components/CarrentCard.jsx";
import CarrentBookingModal from "../components/CarrentBookingModal.jsx";
import EditCarModal from "../components/EditCarModal.jsx";
import CarSearchFilter from "../components/CarSearchFilter.jsx";
import Footer2 from "../components/Footer2.jsx";
import "../assets/styles/RentCarPage.css"; 

const RentCar = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState({});
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useState({
    city: "",
    category: "",
    maxPrice: "",
    pickupDate: "",
    returnDate: "",
  });

  const [selectedCar, setSelectedCar] = useState(null);     
  const [showEditModal, setShowEditModal] = useState(false);
  const [carToEdit, setCarToEdit] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setIsAuthenticated(!!token);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role || "");
        setUserData(parsedUser);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const performSearch = async (params) => {
    setSearchParams(params);
    setLoading(true);
    setError(null);
    setCars([]);

    const { city, pickupDate, returnDate, maxPrice, category } = params;

    if (!city) {
      setError("Please enter a city.");
      setLoading(false);
      return;
    }

    const query = new URLSearchParams();
    if (city) query.append("city", city);
    if (pickupDate) query.append("pickupDate", pickupDate);
    if (returnDate) query.append("returnDate", returnDate);
    if (maxPrice) query.append("maxPrice", maxPrice);
    if (category) query.append("category", category);

    try {
      const res = await fetch(`${apiUrl}/api/cars?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to search cars");
      const data = await res.json();
      setCars(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (carId) => {
    if (!isAuthenticated) {
      alert("Please log in to book a car.");
      return;
    }
    const car = cars.find((c) => c._id === carId);
    if (car) setSelectedCar(car);
  };

  const handleEditCar = (carId) => {
    const car = cars.find((c) => c._id === carId);
    setCarToEdit(car);
    setShowEditModal(true);
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Authentication error.");

    try {
      const res = await fetch(`${apiUrl}/api/cars/${carId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCars((prev) => prev.filter((car) => car._id !== carId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSubmit = async (formData, carId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Authentication error.");

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/cars/${carId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();

      setCars((prev) => prev.map((car) => (car._id === updated._id ? updated : car)));
      setShowEditModal(false);
      setCarToEdit(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCar(null);
    setShowEditModal(false);
    setCarToEdit(null);
  };

  return (
    <>
      {isAuthenticated ? <UserNavbar /> : <Navbar />}

      <div className="container-for-filter">
        <CarSearchFilter onSearch={performSearch} initialParams={searchParams} />
      </div>

      <div className="offers-container" style={{ flex: 1 }}>
        <div className="offers-header">
          <h2 className="offers-title">
            {cars.length > 0 ? "Available Cars" : "Rent Car"}
          </h2>
        </div>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px" }}>Loading cars...</p>
        ) : (
          <div className="offers-grid">
            {cars.length === 0 ? (
              <p className="no-results">
                No cars found. Try adjusting your search.
              </p>
            ) : (
              cars.map((car) => (
                <CarrentCard
                  key={car._id}
                  car={car}
                  userRole={userRole}
                  handleBookNow={handleBookNow}
                  handleEditCar={handleEditCar}
                  handleDeleteCar={handleDeleteCar}
                  searchDates={searchParams}
                />
              ))
            )}
          </div>
        )}
      </div>

      {selectedCar && (
        <>
            <CarrentBookingModal
              car={selectedCar}
              userData={userData}
              searchDates={{
                pickupDate: searchParams.pickupDate || "",
                returnDate: searchParams.returnDate || "",
              }}
              closeModal={closeModal}
            />
        </>
      )}

      {showEditModal && userRole === "admin" && (
        <EditCarModal
          carToEdit={carToEdit}
          handleEditSubmit={handleEditSubmit}
          closeModal={closeModal}
        />
      )}

      <Footer2 />
    </>
  );
};

export default RentCar;