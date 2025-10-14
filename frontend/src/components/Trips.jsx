import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar.jsx";
import Navbar from "./Navbar.jsx";
import "../assets/styles/Offerts.css";
import OfferCard from "./OfferCard.jsx";
import AddOfferModal from "./AddOfferModal.jsx";
import EditOfferModal from "./EditOfferModal.jsx";
import BookingModal from "./BookingModal.jsx";
import ForcedLogout from "./ForcedLogout.js";
import Footer2 from "./Footer2.jsx";

const Trips = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState({});
  const [isForSelf, setIsForSelf] = useState(true);
  const [numGuests, setNumGuests] = useState(1);
  const [guestData, setGuestData] = useState([{ name: "", surname: "" }]);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    title: "",
    description: "",
    price: "",
    duration: "",
    city: "",
    country: "",
    categories: [],
    availableDates: [],
    images: [],
    imageUrls: [],
    mainImageIndex: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOfferData, setNewOfferData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    city: "",
    country: "",
    departureAirportIATA: "",
    categories: [],
    availableDates: [],
    images: [],
    mainImageIndex: null,
    placesToVisit: [{ name: "", description: "", image: null }],
    flightConnections: [{ departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "" }],
  });

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userDataStr = localStorage.getItem("user");
    setIsAuthenticated(!!token);

    if (userDataStr) {
      try {
        const parsedUser = JSON.parse(userDataStr);
        setUserRole(parsedUser.role || "");
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserRole("");
        setUserData({});
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${apiUrl}/api/offers`)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to load offers: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched offers:", data); 
        setOffers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching offers:", error);
        setLoading(false);
      });
  }, [apiUrl]);

  const handleBookNow = (offerId) => {
    if (!isAuthenticated) {
      localStorage.setItem("selectedOffer", offerId);
      navigate("/login");
    } else {
      setSelectedOffer(offerId);
    }
  };

  const handleEditOffer = (offerId) => {
    const offerToEdit = offers.find((offer) => offer._id === offerId);
    if (offerToEdit) {
      console.log("Editing offer:", offerToEdit);
      setSelectedOffer(offerId);
      setEditFormData({
        _id: offerToEdit._id,
        title: offerToEdit.title || "",
        description: offerToEdit.description || "",
        duration: offerToEdit.duration || "",
        price: offerToEdit.price || "",
        city: offerToEdit.city || "",
        country: offerToEdit.country || "",
        categories: offerToEdit.categories || [],
        availableDates: offerToEdit.availableDates || [],
        images: [],
        imageUrls:
          offerToEdit.imageUrls ||
          (offerToEdit.imageUrl ? [offerToEdit.imageUrl] : []),
        mainImageIndex: offerToEdit.mainImageIndex || 0,
      });
    }
  };

  const handleAddNewOfferClick = () => {
    setShowAddModal(true);
  };

  const handleNewOfferChange = (e) => {
    const { name, value, files } = e.target;
    setNewOfferData((prev) => ({
      ...prev,
      [name]: files
        ? Array.from(files)
        : name === "price" || name === "duration"
        ? Number(value)
        : value,
    }));
  };

  const handleAddOfferSubmit = async (formData) => {
    const token = localStorage.getItem("token");
    console.log("Token before send:", token ? "Present" : "MISSING");
    if (!token) return ForcedLogout();

    try {
      const formDataEntries = {};
      for (const [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }
      console.log('FormData being sent to add:', formDataEntries);

      const response = await fetch(`${apiUrl}/api/offers`, { 
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `Raw error: ${response.statusText}` };
        }
        console.log("Server error details:", errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const newOffer = await response.json();
      setOffers((prev) => [...prev, newOffer]);
      setShowAddModal(false);
      setNewOfferData({
        title: "",
        description: "",
        price: "",
        duration: "",
        city: "",
        country: "",
        departureAirportIATA: "",
        categories: [],
        availableDates: [],
        images: [],
        mainImageIndex: null,
        placesToVisit: [{ name: "", description: "", image: null }],
        flightConnections: [{ departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "" }],
      });
      alert("Offer added successfully!");
    } catch (error) {
      console.error("Error adding offer:", error.message);
      alert(`Failed to add offer: ${error.message}`);
    }
  };

  const handleDeleteOffer = (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token is missing.");
      ForcedLogout();
      return;
    }

    fetch(`${apiUrl}/api/offers/${offerId}`, { 
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ message: "Server error" }));
          throw new Error(errorData.message || `Server error: ${res.status}`);
        }
        setOffers(offers.filter((offer) => offer._id !== offerId));
        alert("Offer deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting offer:", error);
        alert(`Failed to delete offer: ${error.message}`);
      });
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: files
        ? Array.from(files)
        : name === "price" || name === "duration"
        ? Number(value)
        : value,
    }));
  };

  const handleEditSubmit = async (formData) => {
    const id = formData.get("_id") || editFormData._id;
    if (!id) {
      console.error("No offer ID found!");
      alert("No offer ID found!");
      return;
    }
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (!token) {
      alert("Authentication token is missing.");
      ForcedLogout();
      navigate("/login");
      return;
    }
    try {
      const formDataEntries = {};
      for (const [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }
      console.log('FormData being sent:', formDataEntries);

      const response = await fetch(`${apiUrl}/api/offers/${id}`, { 
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Server error" }));
        if (response.status === 401) {
          alert("Session expired or invalid token. Please log in again.");
          ForcedLogout();
          navigate("/login");
          return;
        }
        if (response.status === 404) {
          throw new Error("Offer not found on the server.");
        }
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      const updatedOffer = await response.json();
      setOffers((prev) =>
        prev.map((offer) => (offer._id === updatedOffer._id ? updatedOffer : offer))
      );
      setSelectedOffer(null);
      alert("Offer updated successfully!");
    } catch (error) {
      console.error("Error updating offer:", error.message);
      alert(`Failed to update offer: ${error.message}`);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted to Formspree");
    setSelectedOffer(null);
  };

  const closeModal = () => {
    setSelectedOffer(null);
    setShowAddModal(false);
  };

  const handleGuestChange = (index, field, value) => {
    const newGuestData = [...guestData];
    newGuestData[index] = {
      ...newGuestData[index],
      [field]: value,
    };
    setGuestData(newGuestData);
  };

  return (
    <>
      {isAuthenticated ? <UserNavbar /> : <Navbar />}
      <div className="offers-container">
        <div className="offers-header">
          <h2 className="offers-title">Available Offers</h2>
          {userRole === "admin" && (
            <button
              className="add-offer-button"
              onClick={handleAddNewOfferClick}
            >
              Add New Offer
            </button>
          )}
        </div>

        {loading ? (
          <p className="offers-loading">Loading...</p>
        ) : offers.length === 0 ? (
          <p className="offers-empty">No offers found.</p>
        ) : (
          <div className="offers-grid">
            {offers.map((offer, index) => (
              <OfferCard
                key={offer._id || index} 
                offer={offer}
                userRole={userRole}
                handleBookNow={handleBookNow}
                handleEditOffer={handleEditOffer}
                handleDeleteOffer={handleDeleteOffer}
              />
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="offer-modal-wrapper">
            <AddOfferModal
              newOfferData={newOfferData}
              setNewOfferData={setNewOfferData}
              handleNewOfferChange={handleNewOfferChange}
              handleAddOfferSubmit={handleAddOfferSubmit}
              closeModal={closeModal}
            />
          </div>
        )}

        {selectedOffer && userRole === "admin" && (
          <div className="offer-modal-wrapper">
            <EditOfferModal
              offer={offers.find((o) => o._id === selectedOffer)}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
              handleEditFormChange={handleEditFormChange}
              handleEditSubmit={handleEditSubmit}
              closeModal={closeModal}
            />
          </div>
        )}

        {selectedOffer && userRole !== "admin" && (
          <BookingModal
            offer={offers.find((o) => o._id === selectedOffer)}
            userData={userData}
            isForSelf={isForSelf}
            setIsForSelf={setIsForSelf}
            numGuests={numGuests}
            setNumGuests={setNumGuests}
            guestData={guestData}
            setGuestData={setGuestData}
            handleGuestChange={handleGuestChange}
            handleBookingSubmit={handleBookingSubmit}
            closeModal={closeModal}
          />
        )}
      </div>
      <Footer2 />
    </>
  );
};

export default Trips;