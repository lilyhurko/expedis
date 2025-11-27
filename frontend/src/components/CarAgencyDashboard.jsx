import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "../assets/styles/AdminDashboard.module.css";
import {
  FaSuitcase,
  FaCalendarCheck,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCar,
} from "react-icons/fa";
import AddCarModal from "./AddCarModal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const TabNames = {
  MY_CARS: "My Cars",
  RENTS: "Client Rents",
};

export default function CarAgencyDashboard() {
  const [activeTab, setActiveTab] = useState(TabNames.MY_CARS);
  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  return (
    <div className={styles.adminDashboardContainer}>
      <h2 className={styles.pageTitle}>Car Rental Agency Portal</h2>
      <p className={styles.pageSubtitle}>
        Manage your vehicles and client bookings.
      </p>

      <div className={styles.tabsNav}>
        <button
          onClick={() => setActiveTab(TabNames.MY_CARS)}
          className={`${styles.tabBtn} ${
            activeTab === TabNames.MY_CARS ? styles.active : ""
          }`}
        >
          <FaSuitcase /> {TabNames.MY_CARS}
        </button>
        <button
          onClick={() => setActiveTab(TabNames.RENTS)}
          className={`${styles.tabBtn} ${
            activeTab === TabNames.RENTS ? styles.active : ""
          }`}
        >
          <FaCalendarCheck /> {TabNames.RENTS}
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === TabNames.MY_CARS && <MyCars authHeaders={authHeaders} />}
        {activeTab === TabNames.RENTS && (
          <CarAgencyRents authHeaders={authHeaders} />
        )}
      </div>
    </div>
  );
}

const MyCars = ({ authHeaders }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCar, setNewCar] = useState({
    make: "",
    model: "",
    category: "",
    year: "",
    pricePerDay: "",
    city: "",
    country: "",
    image: null,
  });

  const fetchMyCars = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/cars/agency/my-cars`,
        authHeaders
      );
      setCars(res.data);
    } catch (err) {
      alert(
        "Failed to load cars: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchMyCars();
  }, [fetchMyCars]);

  const handleAddCar = async () => {
    const formData = new FormData();
    formData.append("make", newCar.make);
    formData.append("model", newCar.model);
    formData.append("category", newCar.category);
    if (newCar.year) formData.append("year", newCar.year);
    formData.append("pricePerDay", newCar.pricePerDay);
    formData.append("city", newCar.city);
    formData.append("country", newCar.country);
    if (newCar.description) formData.append("description", newCar.description);
    if (newCar.image) formData.append("image", newCar.image);

    formData.append("status", "pending");

    try {
      const res = await axios.post(`${API_URL}/api/cars`, formData, authHeaders);
      setCars([res.data, ...cars]);
      setShowAddModal(false);
      setNewCar({
        make: "", model: "", year: "", pricePerDay: "", city: "", description: "", image: null
      });
      alert("Car added successfully!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      await axios.delete(`${API_URL}/api/cars/${id}`, authHeaders);
      setCars((prev) => prev.filter((c) => c._id !== id));
      alert("Car deleted successfully.");
    } catch (err) {
      alert("Failed to delete car.");
    }
  };

  if (loading) return <div>Loading your cars...</div>;

  return (
    <section className={styles.section}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 className={styles.sectionTitle}>My Cars ({cars.length})</h3>

        <button
          className={styles.glassBtn}
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> Add New Car
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>Model & Location</th>
              <th>Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id}>
                <td>
                  <strong>{car.make} {car.model}</strong> <br />
                  <span className={styles.smallText}>
                    <FaCar /> {car.city}
                  </span>
                </td>
                <td>
                  <div className={styles.smallText}>
                    Price: <b>{car.pricePerDay} PLN / day</b>
                    {car.year && <><br />Year: {car.year}</>}
                  </div>
                </td>
                <td>
                    <span
                        className={`${styles.roleBadge} ${
                        car.status === "active"
                            ? styles.roleAdmin          // зелений – підтверджено
                            : car.status === "pending"
                            ? styles.rolePending        // жовтий – на розгляді
                            : car.status === "rejected"
                            ? styles.roleRejected       // червоний – відхилено
                            : styles.rolePending
                        }`}
                    >
                        {car.status === "pending" ? "PENDING" :
                        car.status === "rejected" ? "REJECTED" :
                        car.status?.toUpperCase() || "ACTIVE"}
                    </span>
                    </td>
                <td>
                  {/* Ти можеш додати Edit пізніше */}
                  {/* <button className={`${styles.actionBtn} ${styles.warningBtn}`}>
                    <FaEdit /> Edit
                  </button> */}
                  <button
                    onClick={() => handleDelete(car._id)}
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div
          className="offer-modal-wrapper"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <AddCarModal
            carData={newCar}
            setCarData={setNewCar}
            onSubmit={handleAddCar}
            closeModal={() => setShowAddModal(false)}
          />
        </div>
      )}
    </section>
  );
};

const CarAgencyRents = ({ authHeaders }) => {
  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/bookings/car-agency-orders`,
        authHeaders
      );
      setRents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchRents();
  }, [fetchRents]);

  if (loading) return <div>Loading client rents...</div>;
  if (rents.length === 0)
    return <div className={styles.emptyState}>No rental bookings yet.</div>;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Incoming Rentals</h3>

      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Car</th>
              <th>Dates</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rents.map((b) => (
              <tr key={b._id}>
                <td>{b.user?.email || "—"}</td>
                <td>
                  {b.car?.make} {b.car?.model}
                </td>
                <td>
                  {new Date(b.pickupDate).toLocaleDateString()} →{" "}
                  {new Date(b.returnDate).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={styles.roleBadge}
                    style={{
                      background:
                        b.status === "confirmed"
                          ? "#28a745"
                          : b.status === "pending"
                          ? "#ffc107"
                          : "#dc3545",
                      color: "white",
                    }}
                  >
                    {b.status?.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};