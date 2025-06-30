import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar.jsx';
import Navbar from './Navbar.jsx';
import '../assets/styles/Offerts.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ForcedLogout from './ForcedLogout.js';

const Offerts = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [isForSelf, setIsForSelf] = useState(true);
  const [numGuests, setNumGuests] = useState(1);
  const [guestData, setGuestData] = useState(Array(1).fill({ name: '', surname: '' }));
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    imageUrl: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOfferData, setNewOfferData] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    imageUrl: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserRole(parsedUser.role);
        setUserData(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }    
  }, []);

  useEffect(() => {
    fetch('http://localhost:5001/api/offers')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load offers.');
        return res.json();
      })
      .then(data => {
        setOffers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);
 // Funkcja wywoływana po kliknięciu "Book Now"
  // Jeśli użytkownik nie jest zalogowany, zapisuje wybraną ofertę w localStorage i przekierowuje do logowania
  // Jeśli zalogowany, ustawia wybraną ofertę w stanie
  const handleBookNow = (offerId) => {
    if (!isAuthenticated) {
      localStorage.setItem('selectedOffer', offerId);
      navigate('/login');
    } else {
      setSelectedOffer(offerId);
    }
  };
  // Funkcja do ustawiania danych formularza edycji dla wybranej oferty
  // Znajduje ofertę po ID i wypełnia formularz jej danymi
  const handleEditOffer = (offerId) => {
    const offerToEdit = offers.find(offer => offer._id === offerId);
    if (offerToEdit) {
      setSelectedOffer(offerId);
      setEditFormData({
        title: offerToEdit.title || '',
        description: offerToEdit.description || '',
        duration: offerToEdit.duration || '',
        price: offerToEdit.price || '',
        imageUrl: offerToEdit.imageUrl || ''
      });
    }
  };
    // Funkcja do otwierania modalu dodawania nowej oferty
  const handleAddNewOfferClick = () => {
    setShowAddModal(true);
  };
  // Obsługa zmiany pól formularza nowej oferty - aktualizuje stan newOfferData

  const handleNewOfferChange = (e) => {
    const { name, value } = e.target;
    setNewOfferData(prev => ({
      ...prev,
      [name]: value
    }));
  };
// Obsługa submitu formularza dodawania nowej oferty
  // Tworzy FormData (ze względu na możliwe przesłanie pliku), wysyła POST na serwer
  // Po sukcesie aktualizuje listę ofert i resetuje formularz
  const handleAddOfferSubmit = (e) => {
    e.preventDefault();

    const priceNum = Number(newOfferData.price);
    const durationNum = Number(newOfferData.duration);

    const formData = new FormData();
    formData.append('title', newOfferData.title);
    formData.append('description', newOfferData.description);
    formData.append('duration', durationNum);  
    formData.append('price', priceNum);        
    if (newOfferData.image) {
      formData.append('image', newOfferData.image);
    }

    fetch('http://localhost:5001/api/offers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add offer.');
        return res.json();
      })
      .then((newOffer) => {
        setOffers([...offers, newOffer]);
        setShowAddModal(false);
        setNewOfferData({
          title: '',
          description: '',
          duration: '',
          price: '',
          imageUrl: null,
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Failed to add offer.');
        ForcedLogout();
      });
  };
// Funkcja do usuwania oferty po potwierdzeniu użytkownika
  // Wysyła DELETE na serwer, a po sukcesie usuwa ofertę z listy w stanie
  const handleDeleteOffer = (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      fetch(`http://localhost:5001/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete offer.');
        return res.json();
      })
      .then(() => {
        setOffers(offers.filter(offer => offer._id !== offerId));
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to delete offer.');
        ForcedLogout();
      });
    }
  };
  // Obsługa zmian w formularzu edycji oferty (aktualizuje stan editFormData)

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
// Obsługa submitu formularza edycji oferty
  // Wysyła PUT na serwer z danymi z formularza
  // Po sukcesie aktualizuje ofertę w stanie i zamyka modal edycji
  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5001/api/offers/${selectedOffer}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...editFormData,
        price: parseFloat(editFormData.price) || 0,
        duration: Number(editFormData.duration) || 0,
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update offer.');
      return res.json();
    })
    .then(updatedOffer => {
      setOffers(offers.map(offer =>
  offer._id === updatedOffer._id ? updatedOffer : offer
));

      setSelectedOffer(null);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to update offer.');
      ForcedLogout();
    });
  };
  // Przykładowa funkcja obsługująca submit formularza rezerwacji

const handleBookingSubmit = async (e) => {

  console.log('Form submitted to Formspree');
};
  // Funkcja zamykająca modale edycji lub dodawania ofert

  const closeModal = () => {
    setSelectedOffer(null);
    setShowAddModal(false);
  };
  // Obsługa zmiany danych gości (np. imię, nazwisko) - aktualizuje stan tablicy guestData

  const handleGuestChange = (index, field, value) => {
    const newGuestData = [...guestData];
    newGuestData[index] = {
      ...newGuestData[index],
      [field]: value
    };
    setGuestData(newGuestData);
  };

  return (
    <>
      {isAuthenticated ? <UserNavbar /> : <Navbar />}
      <div className="offers-container">
        <div className="offers-header">
          <h2 className="offers-title">Available Offers</h2>
          {userRole === 'admin' && (
            <button className="add-offer-button" onClick={handleAddNewOfferClick}>
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
            {offers.map(offer => (
              <div className="offer-card" key={offer._id}>
                {userRole === 'admin' && (
                  <div className="admin-actions">
                    <button 
                      className="edit-icon-button" 
                      onClick={() => handleEditOffer(offer._id)}
                      aria-label="Edit offer"
                    >
                      <FaEdit className="edit-icon" />
                    </button>
                    <button 
                      className="delete-icon-button" 
                      onClick={() => handleDeleteOffer(offer._id)}
                      aria-label="Delete offer"
                    >
                      <FaTrash className="delete-icon" />
                    </button>
                  </div>
                )}
                
                <img src={offer.imageUrl || ''} alt={offer.title} className="offer-image" />
                <h3 className="offer-title">{offer.title}</h3>
                <p className="offer-description">{offer.description}</p>
                <p className="offer-duration"><strong>Duration:</strong> {offer.duration} days</p>
                <div className="offer-footer">
                  <span className="offer-price">{offer.price || 0} PLN</span>
                  <div className="offer-actions">
                    {userRole !== 'admin' && (
                      <button className="book-now-button" onClick={() => handleBookNow(offer._id)}>
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Offer Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal modal-add">
              <div className="modal-header">
                <h3 className="modal-title">Add New Offer</h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddOfferSubmit}>
                  <div className="form-group">
                    <label className="form-label">Title:</label>
                    <input
                      className="form-input"
                      type="text"
                      name="title"
                      value={newOfferData.title}
                      onChange={handleNewOfferChange}
                      required
                      placeholder="Enter offer title"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description:</label>
                    <textarea
                      className="form-input form-textarea"
                      name="description"
                      value={newOfferData.description}
                      onChange={handleNewOfferChange}
                      required
                      placeholder="Enter offer description"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (days):</label>
                    <input
                      className="form-input"
                      type="number"
                      name="duration"
                      value={newOfferData.duration}
                      onChange={handleNewOfferChange}
                      required
                      min="1"
                      placeholder="Number of days"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (PLN):</label>
                    <input
                      className="form-input"
                      type="number"
                      name="price"
                      value={newOfferData.price}
                      onChange={handleNewOfferChange}
                      required
                      min="0"
                      placeholder="Enter price in PLN"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Image:</label>
                    <input
                      className="form-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewOfferData((prev) => ({
                          ...prev,
                          image: e.target.files[0],
                        }))
                      }
                    />
                  </div>
                   <div className="modal-footer">
                <div className="total-price">
                  <strong>Price:</strong> {newOfferData.price || 0} PLN
                </div>
                <div className="buttons-group">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Offer
                  </button>
                </div>
              </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal for regular users */}
       {selectedOffer && userRole !== 'admin' && (
  <div className="modal-overlay">
    <div className="modal modal-booking">
      <div className="modal-header">
        <h3 className="modal-title">
          Booking: {offers.find(o => o._id === selectedOffer)?.title || 'Selected Offer'}
        </h3>
        <button className="modal-close" onClick={closeModal}>×</button>
      </div>
      <div className="modal-body">
        <form 
          action="https://formspree.io/f/mjkwnbvl" 
          method="POST"
          onSubmit={handleBookingSubmit}  
        >
          {/* Add hidden fields for Formspree */}
          <input type="hidden" name="_subject" value="New Booking Request" />
          <input type="hidden" name="_replyto" value={isForSelf ? userData.email : ''} />
          <input type="hidden" name="offerTitle" value={offers.find(o => o._id === selectedOffer)?.title || ''} />
          <input type="hidden" name="offerPrice" value={offers.find(o => o._id === selectedOffer)?.price || 0} />

          <div className="form-group">
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="bookingFor"
                  value="self"
                  checked={isForSelf}
                  onChange={() => setIsForSelf(true)}
                />
                Booking for myself
              </label>
              <label>
                <input
                  type="radio"
                  name="bookingFor"
                  value="others"
                  checked={!isForSelf}
                  onChange={() => setIsForSelf(false)}
                />
                Booking for someone else
              </label>
            </div>
          </div>

          {isForSelf ? (
            <>
              <div className="form-group">
                <label className="form-label">Name:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="name" 
                  value={`${userData.name || ''} ${userData.surname || ''}`} 
                  readOnly 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email:</label>
                <input 
                  type="email" 
                  className="form-input" 
                  name="email"
                  value={userData.email || ''} 
                  readOnly 
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Your Name:</label>
                <input type="text" className="form-input" name="yourName" required />
              </div>
              <div className="form-group">
                <label className="form-label">Your Surname:</label>
                <input type="text" className="form-input" name="yourSurname" required />
              </div>
              <div className="form-group">
                <label className="form-label">Your Email:</label>
                <input type="email" className="form-input" name="email" required />
              </div>

              <div className="form-group">
                <label className="form-label">Number of Guests:</label>
                <input
                  type="number"
                  name="numGuests"
                  min="1"
                  value={numGuests}
                  onChange={e => {
                    const value = parseInt(e.target.value, 10) || 1;
                    setNumGuests(value);
                    setGuestData(Array(value).fill({ name: '', surname: '' }));
                  }}
                  required
                />
              </div>

              {guestData.map((guest, index) => (
                <div key={index} className="guest-group">
                  <h4>Guest {index + 1}</h4>
                  <div className="form-group">
                    <label className="form-label">Name:</label>
                    <input
                      type="text"
                      name={`guest_${index}_name`}
                      value={guest.name}
                      onChange={e => handleGuestChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Surname:</label>
                    <input
                      type="text"
                      name={`guest_${index}_surname`}
                      value={guest.surname}
                      onChange={e => handleGuestChange(index, 'surname', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </>
          )}
          <div className="modal-footer">
            <div className="total-price" style={{ marginRight: 'auto', fontWeight: 'bold', fontSize: '1.1em', paddingTop: '8px' }}>
              Price: {offers.find(o => o._id === selectedOffer)?.price || 0} PLN
            </div>
            <div className="buttons-group">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Booking
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

        {/* Edit Modal for admin */}
        {selectedOffer && userRole === 'admin' && (
          <div className="modal-overlay">
            <div className="modal modal-edit">
              <div className="modal">
                <div className="modal-header">
                  <h3 className="modal-title">Edit Offer: {offers.find(o => o._id === selectedOffer)?.title || 'Selected Offer'}</h3>
                  <button className="modal-close" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleEditSubmit}>
                    <div className="form-group">
                      <label className="form-label">Title:</label>
                      <input
                        className="form-input"
                        type="text"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description:</label>
                      <textarea
                        className="form-input form-textarea"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Duration:</label>
                      <input
                        className="form-input"
                        type="text"
                        name="duration"
                        value={editFormData.duration}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price (PLN):</label>
                      <input
                        className="form-input"
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditFormChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Image URL:</label>
                      <input
                        className="form-input"
                        type="text"
                        name="imageUrl"
                        value={editFormData.imageUrl}
                        onChange={handleEditFormChange}
                        required
                      />
                    </div>
                    <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Offerts;