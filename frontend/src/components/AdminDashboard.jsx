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
    
   
    const fetchOffersCount = () => { };

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
        if (!window.confirm("Confirm top-up? Funds will be added to the user's balance and removed from pending list.")) {
            return;
        }
        try {
            await axios.post(`${API_URL}/api/admin/top-ups/${requestId}/confirm`, {}, authHeaders);
            
            setRequests(prev => prev.filter(req => req._id !== requestId));
            alert("Top-up confirmed. Funds added to user's balance.");
            
        } catch (err) {
            const msg = err.response?.data?.message || 'Transaction failed. Check server logs.';
            setError(msg);
            alert(`Error: ${msg}`);
        }
    };
    
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    if (loading) return <div>Loading top-up requests...</div>;
    if (error) return <div className={styles.emptyState} style={{color: 'red'}}>Error: {error}</div>;

    return (
        <section>
            <h3 className={styles.sectionTitle}>Top-Up Requests ({requests.length})</h3>
            {requests.length === 0 ? (
                <div className={styles.emptyState}>No pending top-up requests.</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.offerTable}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Amount (PLN)</th>
                                <th>Method</th>
                                <th>Requested On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id}>
                                    <td>{req.user.name} {req.user.surname}</td>
                                    <td>{req.user.email}</td>
                                    <td>{req.amount.toFixed(2)}</td>
                                    <td>{req.method || 'Bank Transfer'}</td>
                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleConfirm(req._id)}
                                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                                        >
                                            <FaCheckCircle /> Confirm & Add Funds
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};



const OffersReview = ({ authHeaders }) => {
    return <p className={styles.emptyState}>Offers Review Tab is active. (Please integrate your existing offer fetching logic here).</p>;
};
const BookingsReview = ({ authHeaders }) => {
    return <p className={styles.emptyState}>TODO: Implement Bookings Review Table.</p>;
};
const UserManagement = ({ authHeaders }) => {
    return <p className={styles.emptyState}>TODO: Implement User Management Table.</p>;
};