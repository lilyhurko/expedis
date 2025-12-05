import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import styles from '../assets/styles/AdminDashboard.module.css';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaCarAlt,
  FaDollarSign,
  FaUsers,
  FaTasks,
  FaTrash,
  FaUserTag,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const TabNames = {
  OFFERS: 'Offers for Review',
  TOP_UPS: 'Top-Up Requests',
  BOOKINGS: 'Pending Bookings',
  RENTS: 'Pending Rents',
  CARS: 'Pending Cars',
  USERS: 'User Management',
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(TabNames.OFFERS);
  const token = localStorage.getItem('token');

  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  );

  return (
    <div className={styles.adminDashboardContainer}>
      <h2 className={styles.pageTitle}>Admin Control Panel</h2>
      <p className={styles.pageSubtitle}>
        System health and content moderation for Expedis.
      </p>

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
          onClick={() => setActiveTab(TabNames.RENTS)}
          className={`${styles.tabBtn} ${activeTab === TabNames.RENTS ? styles.active : ''}`}
        >
          <FaCarAlt /> {TabNames.RENTS}
        </button>
        <button
          onClick={() => setActiveTab(TabNames.CARS)}
          className={`${styles.tabBtn} ${activeTab === TabNames.CARS ? styles.active : ''}`}
        >
          <FaCarAlt /> {TabNames.CARS}
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
        {activeTab === TabNames.RENTS && <RentsReview authHeaders={authHeaders} />}
        {activeTab === TabNames.CARS && <PendingCarsReview authHeaders={authHeaders} />}
        {activeTab === TabNames.USERS && <UserManagement authHeaders={authHeaders} />}
      </div>
    </div>
  );
}

export default AdminDashboard;

const OffersReview = ({ authHeaders }) => {
  const [pendingOffers, setPendingOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/offers/pending`, authHeaders);
      setPendingOffers(res.data);
    } catch (err) {
      alert('Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const handleOfferStatusChange = async (offerId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this offer?`)) return;
    try {
      await axios.patch(`${API_URL}/api/offers/${offerId}/status`, { status }, authHeaders);
      setPendingOffers(prev => prev.filter(o => o._id !== offerId));
      alert(`Offer ${status}d`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => { fetchPendingOffers(); }, [fetchPendingOffers]);

  if (loading) return <div>Loading offers...</div>;
  if (pendingOffers.length === 0) return <div className={styles.emptyState}>No pending offers.</div>;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Offers Review</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Agency</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOffers.map(o => (
              <tr key={o._id}>
                <td>{o.title}</td>
                <td>
                  {o.creator?.name || 'Unknown'}<br />
                  <span className={styles.smallText}>{o.creator?.email}</span>
                </td>
                <td>{o.price} PLN</td>
                <td>
                  <button
                    onClick={() => handleOfferStatusChange(o._id, 'active')}
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button
                    onClick={() => handleOfferStatusChange(o._id, 'rejected')}
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
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

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/top-ups/pending`, authHeaders);
      setRequests(res.data);
    } catch (err) {
      alert('Failed to load top-up requests');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const handleConfirm = async (id) => {
    if (!window.confirm('Confirm this top-up?')) return;
    try {
      await axios.post(`${API_URL}/api/admin/top-ups/${id}/confirm`, {}, authHeaders);
      setRequests(prev => prev.filter(r => r._id !== id));
      alert('Top-up confirmed');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  if (loading) return <div>Loading top-ups...</div>;
  if (requests.length === 0) return <div className={styles.emptyState}>No pending top-up requests.</div>;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Top-Up Requests</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r._id}>
                <td>
                  {r.user?.email}<br />
                  <span className={styles.smallText}>{r.user?.name}</span>
                </td>
                <td>{r.amount} PLN</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleConfirm(r._id)}
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/bookings/admin/pending`, authHeaders);
      setBookings(res.data);
    } catch (err) {
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const handleAction = async (id, action) => {
    const status = action === 'confirm' ? 'confirmed' : 'rejected';
    if (!window.confirm(`Mark booking as ${status}?`)) return;
    try {
      await axios.patch(`${API_URL}/api/bookings/${id}/status`, { status }, authHeaders);
      setBookings(prev => prev.filter(b => b._id !== id));
      alert(`Booking ${status}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  if (loading) return <div>Loading bookings...</div>;
  if (bookings.length === 0) return <div className={styles.emptyState}>No pending bookings.</div>;

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Pending Bookings</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>User</th>
              <th>Tour</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id}>
                <td>{b.user?.email}</td>
                <td>{b.offer?.title || '—'}</td>
                <td>{b.amount} PLN</td>
                <td>
                  <button
                    onClick={() => handleAction(b._id, 'confirm')}
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                  >
                    <FaCheckCircle /> Confirm
                  </button>
                  <button
                    onClick={() => handleAction(b._id, 'reject')}
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
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

const RentsReview = ({ authHeaders }) => {
  const [pendingRents, setPendingRents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/cars/admin/bookings/pending`, authHeaders);
      setPendingRents(res.data);
    } catch (err) {
      console.error('Failed to load pending rents:', err);
      alert('Failed to load car bookings');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const handleStatus = async (id, newStatus) => {
    if (!window.confirm(`Confirm booking as ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'}?`)) return;

    try {
      await axios.patch(
        `${API_URL}/api/cars/admin/bookings/${id}/status`,
        { status: newStatus },
        authHeaders
      );
      setPendingRents(prev => prev.filter(r => r._id !== id));
      alert(`Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  useEffect(() => {
    fetchPendingRents();
  }, [fetchPendingRents]);

  if (loading) return <div>Loading bookings...</div>;

  if (pendingRents.length === 0) {
    return (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Pending Rents</h3>
        <div className={styles.emptyState}>No bookings awaiting moderation</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Pending Rents ({pendingRents.length})</h3>

      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Car</th>
              <th>Dates</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRents.map(rent => (
              <tr key={rent._id}>
                <td>
                  <strong>{rent.user?.name || rent.user?.email}</strong>
                  <br />
                  <small>{rent.user?.email}</small>
                </td>
                <td>
                  <strong>{rent.car?.make} {rent.car?.model}</strong>
                  {rent.car?.imageUrl && (
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={`${API_URL}${rent.car.imageUrl}`}
                        alt="car"
                        style={{ width: 100, height: 65, objectFit: 'cover', borderRadius: 6 }}
                      />
                    </div>
                  )}
                  <br />
                  <small style={{ color: '#666' }}>
                    {rent.car?.city}, {rent.car?.country}
                  </small>
                </td>
                <td>
                  {new Date(rent.pickupDate).toLocaleDateString()} →<br />
                  {new Date(rent.returnDate).toLocaleDateString()}
                </td>
                <td>
                  <strong>{rent.totalPrice} PLN</strong>
                </td>
                <td>
                  <button
                    onClick={() => handleStatus(rent._id, 'confirmed')}
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatus(rent._id, 'cancelled')}
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                    style={{ marginLeft: '8px' }}
                  >
                    Cancel
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


const PendingCarsReview = ({ authHeaders }) => {
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingCars = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/cars/admin/pending`, authHeaders);
      setPendingCars(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load cars for review');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const approveCar = async (id) => {
    if (!window.confirm('Approve this car?')) return;
    try {
      await axios.patch(`${API_URL}/api/cars/${id}/status`, { status: 'active' }, authHeaders);
      setPendingCars(prev => prev.filter(c => c._id !== id));
      alert('Car approved and published!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const rejectCar = async (id) => {
    if (!window.confirm('Reject this car?')) return;
    try {
      await axios.patch(`${API_URL}/api/cars/${id}/status`, { status: 'rejected' }, authHeaders);
      setPendingCars(prev => prev.filter(c => c._id !== id));
      alert('Car rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  useEffect(() => {
    fetchPendingCars();
  }, [fetchPendingCars]);

  if (loading) {
    return <div className={styles.loading}>Loading cars...</div>;
  }

  if (pendingCars.length === 0) {
    return (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Pending Car Listings</h3>
        <div className={styles.emptyState}>No pending cars</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        Pending Car Listings ({pendingCars.length})
      </h3>

      <div className={styles.tableWrapper}>
        <table className={styles.offerTable}>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Car</th>
              <th>Agency</th>
              <th>Price/day</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingCars.map(car => (
              <tr key={car._id}>
                <td>
                  {car.imageUrl ? (
                    <img
                      src={`${API_URL}${car.imageUrl}`}
                      alt={`${car.make} ${car.model}`}
                      style={{
                        width: '100px',
                        height: '65px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100px',
                        height: '65px',
                        background: '#e9ecef',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#888',
                        fontSize: '12px',
                      }}
                    >
                      No photo
                    </div>
                  )}
                </td>

                <td>
                  <strong>{car.make} {car.model || '—'}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    {car.category || ''} {car.year ? `• ${car.year}` : ''}
                  </small>
                </td>

                <td>
                  {car.agency?.name || car.agency?.email || '—'}
                </td>

                <td>
                  <strong>{car.pricePerDay || '—'} PLN</strong>
                </td>

                <td>
                  {car.city || ''}{car.city && car.country ? ', ' : ''}{car.country || '—'}
                </td>

                <td>
                  <button
                    onClick={() => approveCar(car._id)}
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button
                    onClick={() => rejectCar(car._id)}
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                    style={{ marginLeft: '8px' }}
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


const UserManagement = ({ authHeaders }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, authHeaders);
      setUsers(res.data);
    } catch (err) {
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const changeRole = async (userId, currentRole) => {
    const newRole = prompt('Enter new role (user / agency / admin):', currentRole);
    if (!newRole || !['user', 'agency', 'admin'].includes(newRole.toLowerCase())) {
      alert('Invalid role');
      return;
    }
    try {
      await axios.patch(`${API_URL}/api/admin/users/${userId}/role`, { role: newRole.toLowerCase() }, authHeaders);
      setUsers(prev => prev.map(u => (u._id === userId ? { ...u, role: newRole.toLowerCase() } : u)));
      alert('Role updated');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, authHeaders);
      setUsers(prev => prev.filter(u => u._id !== userId));
      alert('User deleted');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (loading) return <div>Loading users...</div>;

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
                  {user.name} {user.surname}
                  <br />
                  <span className={styles.smallText}>@{user.username}</span>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`${styles.roleBadge} ${
                      user.role === 'admin'
                        ? styles.roleAdmin
                        : user.role === 'agency'
                        ? styles.roleAgency
                        : styles.roleUser
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>{(user.balance || 0).toFixed(2)} PLN</td>
                <td>
                  <button
                    onClick={() => changeRole(user._id, user.role)}
                    className={`${styles.actionBtn} ${styles.warningBtn}`}
                  >
                    <FaUserTag /> Role
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
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
    </section>
  );
};