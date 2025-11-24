import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/AdminDashboard.module.css';
import { 
    FaSuitcase, FaCalendarCheck, FaEdit, FaTrash, 
    FaPlus, FaMapMarkerAlt, FaPlane 
} from 'react-icons/fa';

import AddOfferModal from "./AddOfferModal.jsx";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const TabNames = {
    MY_OFFERS: 'My Tours',
    BOOKINGS: 'Client Bookings',
};

function AgencyDashboard() {
    const [activeTab, setActiveTab] = useState(TabNames.MY_OFFERS);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const authHeaders = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    return (
        <div className={styles.adminDashboardContainer}>
            <h2 className={styles.pageTitle}>Agency Portal</h2>
            <p className={styles.pageSubtitle}>Manage your travel offers and reservations.</p>

            <div className={styles.tabsNav}>
                <button 
                    onClick={() => setActiveTab(TabNames.MY_OFFERS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.MY_OFFERS ? styles.active : ''}`}
                >
                    <FaSuitcase /> {TabNames.MY_OFFERS}
                </button>
                <button 
                    onClick={() => setActiveTab(TabNames.BOOKINGS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.BOOKINGS ? styles.active : ''}`}
                >
                    <FaCalendarCheck /> {TabNames.BOOKINGS}
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === TabNames.MY_OFFERS && <MyOffers authHeaders={authHeaders} navigate={navigate} />} 
                {activeTab === TabNames.BOOKINGS && <AgencyBookings authHeaders={authHeaders} />}
            </div>
        </div>
    );
}

const MyOffers = ({ authHeaders, navigate }) => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [newOfferData, setNewOfferData] = useState({
        title: "", description: "", price: "", duration: "", city: "", country: "",
        departureAirportIATA: "", categories: [], availableDates: [], images: [],
        mainImageIndex: null, placesToVisit: [{ name: "", description: "", image: null }],
        flightConnections: [
          { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "outbound" },
          { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "return" },
        ],
    });

    const fetchMyOffers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/offers/agency/my-offers`, authHeaders);
            setOffers(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load offers.");
        } finally { setLoading(false); }
    }, [authHeaders]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will permanently delete your tour.")) return;
        try {
            await axios.delete(`${API_URL}/api/offers/${id}`, authHeaders);
            setOffers(prev => prev.filter(o => o._id !== id));
            alert("Tour deleted successfully.");
        } catch (err) { alert(err.message); }
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
        try {
            const response = await axios.post(`${API_URL}/api/offers`, formData, authHeaders);
            
            setOffers((prev) => [response.data, ...prev]);
            setShowAddModal(false);
            
            setNewOfferData({
                title: "", description: "", price: "", duration: "", city: "", country: "",
                departureAirportIATA: "", categories: [], availableDates: [], images: [],
                mainImageIndex: null, placesToVisit: [{ name: "", description: "", image: null }],
                flightConnections: [],
            });
            alert("Offer added successfully!");
        } catch (error) {
            console.error("Error adding offer:", error);
            alert(`Failed to add offer: ${error.response?.data?.message || error.message}`);
        }
    };

    useEffect(() => { fetchMyOffers(); }, [fetchMyOffers]);

    if (loading) return <div>Loading your tours...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <section className={styles.section}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 className={styles.sectionTitle}>My Active Tours ({offers.length})</h3>
            
            <button 
                className={styles.glassBtn} 
                onClick={() => setShowAddModal(true)}
            >
                <FaPlus /> Create New Tour
            </button>

        </div>

            <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead>
                        <tr>
                            <th>Title & Location</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.map(o => (
                            <tr key={o._id}>
                                <td>
                                    <strong>{o.title}</strong> <br/>
                                    <span className={styles.smallText}><FaMapMarkerAlt/> {o.city}, {o.country}</span>
                                </td>
                                <td>
                                    <div className={styles.smallText}>
                                        Price: <b>{o.price} PLN</b><br/>
                                        Duration: {o.duration} days<br/>
                                        Flights: {o.flightConnections?.length || 0} <FaPlane size={10}/>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.roleBadge} ${
                                        o.status === 'active' ? styles.roleAdmin : 
                                        o.status === 'rejected' ? styles.roleUser : styles.roleAgency
                                    }`}>
                                        {o.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => navigate(`/edit-offer/${o._id}`)} // Перехід на сторінку редагування (або відкриття модалки редагування)
                                        className={`${styles.actionBtn} ${styles.warningBtn}`}
                                    >
                                        <FaEdit/> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(o._id)} 
                                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                    >
                                        <FaTrash/> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="offer-modal-wrapper" style={{position:'fixed', top:0, left:0, right:0, bottom:0, zIndex: 1000}}>
                    <AddOfferModal
                        newOfferData={newOfferData}
                        setNewOfferData={setNewOfferData}
                        handleNewOfferChange={handleNewOfferChange}
                        handleAddOfferSubmit={handleAddOfferSubmit}
                        closeModal={() => setShowAddModal(false)}
                    />
                </div>
            )}
        </section>
    );
};

const AgencyBookings = ({ authHeaders }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/bookings/agency-orders`, authHeaders);
            setBookings(response.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    }, [authHeaders]);

    
    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    
    if(loading) return <div>Loading bookings...</div>;
    if(bookings.length === 0) return <div className={styles.emptyState}>No bookings received yet.</div>;

    return (
        <section className={styles.section}>
             <h3 className={styles.sectionTitle}>Incoming Bookings</h3>
           <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Tour</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    {bookings.map(b => (
                        <tr key={b._id}>
                            <td>{b.user?.email}</td>
                            <td>{b.offer?.title}</td>
                            <td>{b.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>
        </section>
    );
};

export default AgencyDashboard;