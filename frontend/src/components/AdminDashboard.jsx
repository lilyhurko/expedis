import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import styles from '../assets/styles/AdminDashboard.module.css';
import { FaCheckCircle, FaTimesCircle, FaGlobe, FaDollarSign, FaUsers, FaTasks } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const TabNames = {
    OFFERS: 'Offers for Review',
    TOP_UPS: 'Top-Up Requests',
    BOOKINGS: 'Pending Bookings',
    USERS: 'User Management',
};


function AdminDashboard() {
    const [activeTab, setActiveTab] = useState(TabNames.OFFERS);

    const token = localStorage.getItem('token');
    
    const authHeaders = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]); 

    return (
        <div className={styles.adminDashboardContainer}>
            <h2 className={styles.pageTitle}>Admin Control Panel</h2>
            <p className={styles.pageSubtitle}>System health and content moderation for Expedis.</p>

            <div className={styles.tabsNav}>
                <button 
                    onClick={() => setActiveTab(TabNames.OFFERS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.OFFERS ? styles.active : ''}`}
                >
                    <FaTasks /> {TabNames.OFFERS}
                </button>
                <button 
                    onClick={() => setActiveTab(TabNames.TOP_UPS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.TOP_UPS ? styles.active : ''}`}
                >
                    <FaDollarSign /> {TabNames.TOP_UPS}
                </button>
                <button 
                    onClick={() => setActiveTab(TabNames.BOOKINGS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.BOOKINGS ? styles.active : ''}`}
                >
                    <FaGlobe /> {TabNames.BOOKINGS}
                </button>
                <button 
                    onClick={() => setActiveTab(TabNames.USERS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.USERS ? styles.active : ''}`}
                >
                    <FaUsers /> {TabNames.USERS}
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === TabNames.OFFERS && <OffersReview authHeaders={authHeaders} />} 
                {activeTab === TabNames.TOP_UPS && <TopUpsTable authHeaders={authHeaders} />} 
                {activeTab === TabNames.BOOKINGS && <BookingsReview authHeaders={authHeaders} />}
                {activeTab === TabNames.USERS && <UserManagement authHeaders={authHeaders} />}
            </div>
        </div>
    );
}
export default AdminDashboard;



const OffersReview = ({ authHeaders }) => {
    const [pendingOffers, setPendingOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingOffers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {

            const response = await axios.get(`${API_URL}/api/admin/offers/pending`, authHeaders);
            setPendingOffers(response.data);
        } catch (err) {
            console.error("Error fetching pending offers:", err);
            setError(err.response?.data?.message || "Failed to load offers. Check server logs.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    const handleOfferStatusChange = async (offerId, status) => {
        const isApproved = status === 'active';
        const confirmMsg = isApproved 
            ? 'Are you sure you want to approve this offer and publish it?' 
            : 'Are you sure you want to reject this offer?';
            
        if (!window.confirm(confirmMsg)) return;

        try {
            await axios.patch(`${API_URL}/api/offers/${offerId}/status`, { status }, authHeaders);
            
            setPendingOffers(prev => prev.filter(offer => offer._id !== offerId));
            alert(`Offer successfully ${isApproved ? 'approved' : 'rejected'}. Agency notified.`);
            
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update offer status.';
            alert(`Error: ${msg}`);
        }
    };

    useEffect(() => {
        fetchPendingOffers();
    }, [fetchPendingOffers]);

    if (loading) return <div>Loading offers...</div>;
    if (error) return <div style={{color: 'red'}} className={styles.emptyState}>Error: {error}</div>;
    
    if (pendingOffers.length === 0) {
        return <div className={styles.emptyState}>No offers currently require review. </div>;
    }

    return (
        <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Offers for Review ({pendingOffers.length})</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Agency</th>
                            <th>Price / Duration</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingOffers.map(offer => (
                            <tr key={offer._id}>
                                <td>{offer._id.slice(-6)}</td>
                                <td>{offer.title}</td>
                                <td>
                                    {offer.creator?.name || 'Unknown'} <br/>
                                    <small>{offer.creator?.email}</small>
                                </td>
                                <td>{offer.price} PLN / {offer.duration} days</td>
                                <td>{new Date(offer.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => handleOfferStatusChange(offer._id, 'active')}
                                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                                        title="Approve"
                                    >
                                        <FaCheckCircle /> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleOfferStatusChange(offer._id, 'rejected')}
                                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                        title="Reject"
                                    >
                                        <FaTimesCircle /> Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};



const TopUpsTable = ({ authHeaders }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/admin/top-ups/pending`, authHeaders);
            setRequests(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load top-up requests.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    const handleConfirm = async (requestId) => {
        if (!window.confirm("Confirm top-up? Funds will be added to user's balance.")) return;
        try {
            await axios.post(`${API_URL}/api/admin/top-ups/${requestId}/confirm`, {}, authHeaders);
            setRequests(prev => prev.filter(req => req._id !== requestId));
            alert("Top-up confirmed.");
        } catch (err) {
            alert(`Error: ${err.response?.data?.message || 'Failed.'}`);
        }
    };
    
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    if (loading) return <div>Loading top-up requests...</div>;
    if (error) return <div className={styles.emptyState} style={{color: 'red'}}>Error: {error}</div>;

    if (requests.length === 0) return <div className={styles.emptyState}>No pending top-up requests.</div>;

    return (
        <section>
            <h3 className={styles.sectionTitle}>Top-Up Requests ({requests.length})</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Amount (PLN)</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req._id}>
                                <td>{req.user?.name} {req.user?.surname}</td>
                                <td>{req.user?.email}</td>
                                <td>{req.amount.toFixed(2)}</td>
                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => handleConfirm(req._id)}
                                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                                    >
                                        <FaCheckCircle /> Confirm
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};




const BookingsReview = ({ authHeaders }) => {
    return <p className={styles.emptyState}>TODO: Implement Bookings Review Table.</p>;
};
const UserManagement = ({ authHeaders }) => {
    return <p className={styles.emptyState}>TODO: Implement User Management Table.</p>;
};