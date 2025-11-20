import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import styles from '../assets/styles/AdminDashboard.module.css';
import { FaCheckCircle, FaTimesCircle, FaGlobe, FaDollarSign, FaUsers, FaTasks, FaTrash, FaUserTag } from 'react-icons/fa';

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


// --- 1. Offers Review ---
const OffersReview = ({ authHeaders }) => {
    const [pendingOffers, setPendingOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingOffers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/offers/pending`, authHeaders);
            setPendingOffers(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load offers.");
        } finally { setLoading(false); }
    }, [authHeaders]);

    const handleOfferStatusChange = async (offerId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this offer?`)) return;
        try {
            await axios.patch(`${API_URL}/api/offers/${offerId}/status`, { status }, authHeaders);
            setPendingOffers(prev => prev.filter(o => o._id !== offerId));
            alert(`Offer ${status}d.`);
        } catch (err) { alert(err.message); }
    };

    useEffect(() => { fetchPendingOffers(); }, [fetchPendingOffers]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;
    if (pendingOffers.length === 0) return <div className={styles.emptyState}>No pending offers.</div>;

    return (
        <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Offers Review</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead><tr><th>Title</th><th>Agency</th><th>Price</th><th>Actions</th></tr></thead>
                    <tbody>
                        {pendingOffers.map(o => (
                            <tr key={o._id}>
                                <td>{o.title}</td>
                                <td>
                                    {o.creator?.name || 'Unknown'} <br/>
                                    <span className={styles.smallText}>{o.creator?.email}</span>
                                </td>
                                <td>{o.price} PLN</td>
                                <td>
                                    <button onClick={() => handleOfferStatusChange(o._id, 'active')} className={`${styles.actionBtn} ${styles.approveBtn}`}><FaCheckCircle/> Approve</button>
                                    <button onClick={() => handleOfferStatusChange(o._id, 'rejected')} className={`${styles.actionBtn} ${styles.rejectBtn}`}><FaTimesCircle/> Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

// --- 2. Top-Ups ---
const TopUpsTable = ({ authHeaders }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/top-ups/pending`, authHeaders);
            setRequests(response.data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, [authHeaders]);

    const handleConfirm = async (id) => {
        if(!window.confirm("Confirm top-up?")) return;
        try {
            await axios.post(`${API_URL}/api/admin/top-ups/${id}/confirm`, {}, authHeaders);
            setRequests(prev => prev.filter(r => r._id !== id));
            alert("Confirmed.");
        } catch(e) { alert(e.message); }
    };

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;
    if (requests.length === 0) return <div className={styles.emptyState}>No pending requests.</div>;

    return (
        <section>
            <h3 className={styles.sectionTitle}>Top-Ups</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead><tr><th>User</th><th>Amount</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r._id}>
                                <td>
                                    {r.user?.email} <br/>
                                    <span className={styles.smallText}>{r.user?.name} {r.user?.surname}</span>
                                </td>
                                <td>{r.amount} PLN</td>
                                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td><button onClick={() => handleConfirm(r._id)} className={`${styles.actionBtn} ${styles.approveBtn}`}><FaCheckCircle/> Confirm</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

// --- 3. Bookings ---
const BookingsReview = ({ authHeaders }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/bookings/pending`, authHeaders);
            setBookings(response.data);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, [authHeaders]);

    const handleAction = async (id, action) => {
        if(!window.confirm(`${action} booking?`)) return;
        try {
            await axios.post(`${API_URL}/api/admin/bookings/${id}/${action}`, {}, authHeaders);
            setBookings(prev => prev.filter(b => b._id !== id));
            alert(`Booking ${action}ed.`);
        } catch(e) { alert(e.message); }
    };

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    if(loading) return <div>Loading...</div>;
    if(error) return <div className={styles.errorMessage}>Error: {error}</div>;
    if(bookings.length === 0) return <div className={styles.emptyState}>No pending bookings.</div>;

    return (
        <section>
            <h3 className={styles.sectionTitle}>Pending Bookings</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead><tr><th>User</th><th>Tour</th><th>Amount</th><th>Action</th></tr></thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b._id}>
                                <td>
                                    {b.user?.email} <br/>
                                    <span className={styles.smallText}>{b.user?.name} {b.user?.surname}</span>
                                </td>
                                <td>{b.offer?.title}</td>
                                <td>{b.amount} PLN</td>
                                <td>
                                    <button onClick={() => handleAction(b._id, 'confirm')} className={`${styles.actionBtn} ${styles.approveBtn}`}>Confirm</button>
                                    <button onClick={() => handleAction(b._id, 'reject')} className={`${styles.actionBtn} ${styles.rejectBtn}`}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};


// --- 4. User Management ---
const UserManagement = ({ authHeaders }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/users`, authHeaders);
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || "Failed to load users.");
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    const handleChangeRole = async (userId, currentRole) => {
        const newRole = prompt("Enter new role (user / agency / admin):", currentRole);
        if (!newRole || newRole === currentRole) return;
        
        if (!['user', 'agency', 'admin'].includes(newRole)) {
            alert("Invalid role! Use: user, agency, or admin.");
            return;
        }

        try {
            await axios.patch(`${API_URL}/api/admin/users/${userId}/role`, { role: newRole }, authHeaders);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            alert(`Role updated to ${newRole}`);
        } catch (err) {
            alert(`Error: ${err.response?.data?.message}`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this user?")) return;
        try {
            await axios.delete(`${API_URL}/api/admin/users/${userId}`, authHeaders);
            setUsers(prev => prev.filter(u => u._id !== userId));
            alert("User deleted.");
        } catch (err) {
            alert(`Error: ${err.response?.data?.message}`);
        }
    };

    // Helper to get correct badge style
    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'admin': return `${styles.roleBadge} ${styles.roleAdmin}`;
            case 'agency': return `${styles.roleBadge} ${styles.roleAgency}`;
            default: return `${styles.roleBadge} ${styles.roleUser}`;
        }
    };

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <section className={styles.section}>
            <h3 className={styles.sectionTitle}>All Users ({users.length})</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.offerTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Balance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    {user.name} {user.surname} <br/> 
                                    <span className={styles.smallText}>@{user.username}</span>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={getRoleBadgeClass(user.role)}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>{user.balance?.toFixed(2)} PLN</td>
                                <td>
                                    <button 
                                        onClick={() => handleChangeRole(user._id, user.role)}
                                        className={`${styles.actionBtn} ${styles.warningBtn}`}
                                        title="Change Role"
                                    >
                                        <FaUserTag /> Role
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUser(user._id)}
                                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                        title="Delete User"
                                    >
                                        <FaTrash /> Delete
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