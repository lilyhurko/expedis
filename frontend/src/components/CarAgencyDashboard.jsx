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
import EditCarModal from "./EditCarModal";

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

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

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
      const res = await axios.get(`${API_URL}/api/cars/`, authHeaders);
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

  const openEditModal = (car) => {
    setEditingCar(car);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCar(null);
  };

  const handleCarUpdated = (updatedCar) => {
    setCars((prev) =>
      prev.map((c) => (c._id === updatedCar._id ? updatedCar : c))
    );
    closeEditModal();
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
                        ? styles.roleAdmin          
                        : car.status === "pending"
                        ? styles.rolePending        
                        : car.status === "rejected"
                        ? styles.roleRejected       
                        : styles.rolePending
                    }`}
                  >
                    {car.status === "pending" ? "PENDING" :
                     car.status === "rejected" ? "REJECTED" :
                     car.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                      onClick={() => openEditModal(car)}
                      className={`${styles.actionBtn} ${styles.editBtn || ""}`}
                      style={{ background: "transparent", color: "#000" }}
                      title="Edit car"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(car._id)}
                      className={`${styles.actionBtn} ${styles.rejectBtn}`}
                      title="Delete car"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="offer-modal-wrapper" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <AddCarModal
            carData={newCar}
            setCarData={setNewCar}
            onSubmit={handleAddCar}
            closeModal={() => setShowAddModal(false)}
          />
        </div>
      )}

      {showEditModal && editingCar && (
        <div className="offer-modal-wrapper" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
          <EditCarModal
            carToEdit={editingCar}
            handleEditSubmit={async (formData, carId) => {
              const token = localStorage.getItem("token");
              const res = await axios.put(
                `${API_URL}/api/cars/${carId}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              handleCarUpdated(res.data); 
            }}
            closeModal={closeEditModal}
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
      const res = await axios.get(`${API_URL}/api/cars/agency/bookings`, authHeaders);
      setRents(res.data);
    } catch (err) {
      console.error('Failed to load agency bookings:', err);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchRents();
  }, [fetchRents]);

  if (loading) return <div>Loading bookings...</div>;
  if (rents.length === 0)
    return <div className={styles.emptyState}>No car bookings</div>;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Client Bookings ({rents.length})</h3>

      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Car</th>
              <th>Dates</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rents.map((b) => (
              <tr key={b._id}>
                <td>
                  <strong>{b.user?.name || b.user?.email}</strong>
                  <br />
                  <small>{b.user?.email}</small>
                </td>
                <td>
                  <strong>{b.car?.make} {b.car?.model}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    {b.car?.city}, {b.car?.country}
                  </small>
                </td>
                <td>
                  {new Date(b.pickupDate).toLocaleDateString()} →<br />
                  {new Date(b.returnDate).toLocaleDateString()}
                </td>
                <td>
                  <strong>{b.totalPrice} PLN</strong>
                </td>
                <td>
                  <span
                    className={`${styles.roleBadge} ${
                      b.status === "confirmed"
                        ? styles.roleConfirmed
                        : b.status === "pending"
                        ? styles.rolePending
                        : b.status === "cancelled"
                        ? styles.roleCancelled
                        : b.status === "completed" 
                        ? styles.roleCompleted
                        : styles.roleRejected 
                    }`}
                  >
                    {b.status === "confirmed" ? "CONFIRMED" :
                    b.status === "pending" ? "PENDING" :
                    b.status === "cancelled" ? "CANCELLED" :
                    b.status === "completed" ? "COMPLETED" :
                    b.status === "rejected" ? "REJECTED" :
                    b.status?.toUpperCase() || "UNKNOWN"}
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