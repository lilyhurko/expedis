import React, { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer2 from "../components/Footer2.jsx";
import CarrentCard from "../components/CarrentCard.jsx"; 
import CarrentBookingModal from "../components/CarrentBookingModal.jsx"; 
import ForcedLogout from "../components/ForcedLogout.js";
import "../assets/styles/Offerts.css"; 

const RentCar = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [userData, setUserData] = useState({});
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useState({
        city: "",
        pickupDate: "",
        returnDate: "",
        minPrice: "",
        maxPrice: "",
    });
    const [selectedCar, setSelectedCar] = useState(null); 

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

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setCars([]);
        
        const { city, pickupDate, returnDate, minPrice, maxPrice } = searchParams;
        if (!city) {
            setError("Please enter a city.");
            setLoading(false);
            return;
        }

        const query = new URLSearchParams({ 
            city: city, 
            pickupDate: pickupDate, 
            returnDate: returnDate,
            minPrice: minPrice,  
            maxPrice: maxPrice  
        }).toString();

        try {
            const response = await fetch(`${apiUrl}/api/cars?${query}`);
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: response.statusText }));
                 throw new Error(errorData.message || `Failed to search cars: ${response.statusText}`);
            }
            
            const data = await response.json();
            setCars(data);
        } catch (err) {
            console.error("Error fetching cars:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (carId) => {
        if (!isAuthenticated) {
            alert("Please log in to book a car.");
        } else {
            const carToBook = cars.find(car => car._id === carId);
            setSelectedCar(carToBook);
        }
    };

    const closeModal = () => {
        setSelectedCar(null);
    };

    return (
        <>
            {isAuthenticated ? <UserNavbar /> : <Navbar />}
            <div className="offers-container"> 
                <div className="offers-header">
                    <h2 className="offers-title">Available Cars</h2>
                </div>
                
                <form onSubmit={handleSearch} className="offers-header" style={{ marginBottom: '20px', gap: '10px' }}>
                    <input 
                        type="text" 
                        name="city"
                        placeholder="City (e.g., Lublin)" 
                        value={searchParams.city}
                        onChange={handleSearchChange}
                        required
                        className="p-2 border rounded" 
                    />
                    <input 
                        type="text" 
                        name="minPrice"
                        value={searchParams.minPrice}
                        onChange={handleSearchChange}
                        required
                        className="p-2 border rounded"
                    />
                    <input 
                        type="text" 
                        name="maxPrice"
                        value={searchParams.maxPrice}
                        onChange={handleSearchChange}
                        required
                        className="p-2 border rounded"
                    />
                    <input 
                        type="date" 
                        name="pickupDate"
                        value={searchParams.pickupDate}
                        onChange={handleSearchChange}
                        required
                        className="p-2 border rounded"
                    />
                    <input 
                        type="date" 
                        name="returnDate"
                        value={searchParams.returnDate}
                        onChange={handleSearchChange}
                        required
                        className="p-2 border rounded"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="add-offer-button navbar-login-button"
                    >
                        {loading ? 'Searching...' : 'Find Cars'}
                    </button>
                </form>

                {error && <p className="offers-error" style={{ color: 'red' }}>Error: {error}</p>}

                {loading ? (
                    <p className="offers-loading">Loading...</p>
                ) : cars.length === 0 && searchParams.city ? (
                    <p className="offers-empty">Unfortunately, no cars were found for your query.</p>
                ) : (
                    <div className="offers-grid">
                        {cars.map((car) => (
                            <CarrentCard 
                                key={car._id} 
                                car={car}
                                userRole={userRole} 
                                handleBookNow={handleBookNow}
                                searchDates={{ pickupDate: searchParams.pickupDate, returnDate: searchParams.returnDate }} 
                            />
                        ))}
                    </div>
                )}
                
                {!loading && cars.length === 0 && !searchParams.city && (
                    <p className="offers-empty">Enter a city and dates to find available cars.</p>
                )}


                {selectedCar && (
                    <div className="offer-modal-wrapper">
                        <CarrentBookingModal 
                            car={selectedCar}
                            userData={userData}
                            searchDates={{ pickupDate: searchParams.pickupDate, returnDate: searchParams.returnDate }}
                            closeModal={closeModal}
                        />
                    </div>
                )}
            </div>
            <Footer2 />
        </>
    );
};

export default RentCar;