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
    const [pendingOffers, setPendingOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    
    const authHeaders = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]); 
    
    const fetchPendingOffers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/admin/offers/pending`, authHeaders);
            setPendingOffers(response.data);
        } catch (err) {
            console.error("Error fetching pending offers:", err);
            setError(err.message || "Failed to load offers. Check server status.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]); 

    
    useEffect(() => {
        if (activeTab === TabNames.OFFERS) {
 
            fetchPendingOffers();
        }
    }, [activeTab, fetchPendingOffers]);


    const handleOfferStatusChange = async (offerId, status) => {
        const isApproved = status === 'active';
        const confirmMsg = isApproved 
            ? 'Are you sure you want to approve this offer and publish it?' 
            : 'Are you sure you want to reject this offer?';
            
        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            await axios.patch(`${API_URL}/api/offers/${offerId}/status`, { status }, authHeaders);
            
            setPendingOffers(prev => prev.filter(offer => offer._id !== offerId));
            alert(`Offer successfully ${isApproved ? 'approved' : 'rejected'}. Agency notified.`);
            
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update offer status.';
            setError(msg);
            alert(`Error: ${msg}`);
        }
    };

    const renderOffersReview = () => {
        if (loading) return <div>Loading offers...</div>;
        if (error) return <div style={{color: 'red'}}>Error: {error}</div>;
        
        if (pendingOffers.length === 0) {
            return <div className={styles.emptyState}>No offers currently require review. </div>;
        }

        return (
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
                                    {offer.creator.name} ({offer.creator.email})
                                </td>
                                <td>{offer.price} PLN / {offer.duration} days</td>
                                <td>{new Date(offer.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => handleOfferStatusChange(offer._id, 'active')}
                                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                                        title="Approve and Publish"
                                    >
                                        <FaCheckCircle /> Approve
                                    </button>
                                    <button 
                                        onClick={() => handleOfferStatusChange(offer._id, 'rejected')}
                                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                        title="Reject and Delete"
                                    >
                                        <FaTimesCircle /> Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    return (
        <div className={styles.adminDashboardContainer}>
            <h2 className={styles.pageTitle}> Admin Control Panel</h2>
            <p className={styles.pageSubtitle}>System health and content moderation for Expedis.</p>

            <div className={styles.tabsNav}>
                <button 
                    onClick={() => setActiveTab(TabNames.OFFERS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.OFFERS ? styles.active : ''}`}
                >
                    <FaTasks /> {TabNames.OFFERS} ({pendingOffers.length})
                </button>
                <button 
                    onClick={() => setActiveTab(TabNames.TOP_UPS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.TOP_UPS ? styles.active : ''}`}
                >
                    <FaDollarSign /> {TabNames.TOP_UPS} (TODO)
                </button>
                <button 
                    onClick={() => setActiveTab(TabNames.BOOKINGS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.BOOKINGS ? styles.active : ''}`}
                >
                    <FaGlobe /> {TabNames.BOOKINGS} (TODO)
                </button>
                <button 
                    onClick={() => setActiveTab(TabNames.USERS)} 
                    className={`${styles.tabBtn} ${activeTab === TabNames.USERS ? styles.active : ''}`}
                >
                    <FaUsers /> {TabNames.USERS} (TODO)
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === TabNames.OFFERS && (
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>{TabNames.OFFERS}</h3>
                        {renderOffersReview()}
                    </section>
                )}
                
                {activeTab === TabNames.TOP_UPS && (
                     <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>{TabNames.TOP_UPS}</h3>
                        <p className={styles.emptyState}>TODO: Implement fetching and processing top-up requests using /api/admin/top-ups/pending.</p>
                     </section>
                )}

                {activeTab === TabNames.BOOKINGS && (
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>{TabNames.BOOKINGS}</h3>
                        <p className={styles.emptyState}>TODO: Implement fetching and confirmation of pending bookings using /api/admin/bookings/pending (All bookings).</p>
                    </section>
                )}

                {activeTab === TabNames.USERS && (
                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>{TabNames.USERS}</h3>
                        <p className={styles.emptyState}>TODO: Implement fetching all users and management actions (e.g., Ban, Change Role).</p>
                    </section>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;