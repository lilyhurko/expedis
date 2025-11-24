import React, { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker"; 
import UserNavbar from "../components/UserNavbar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer2 from "../components/Footer2.jsx";
import CarrentCard from "../components/CarrentCard.jsx"; 
import CarrentBookingModal from "../components/CarrentBookingModal.jsx"; 
import EditCarModal from "../components/EditCarModal.jsx"; 
import ForcedLogout from "../components/ForcedLogout.js";
import "../assets/styles/Offerts.css"; 

const carCategories = [
    "Sedan (Compact)", 
    "SUV/Crossover", 
    "Sedan", 
    "Sedan (Grand Turismo)", 
    "SUV/Crossover (Coupe)", 
    "Hatchback", 
    "Sedan (Luxury)", 
    "Sedan (Executive)"
];

const RentCar = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [userData, setUserData] = useState({});
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useState({
        city: "",
        category: "", 
        maxPrice: "",
        pickupDate: "",
        returnDate: "",
    });
    const [dateRange, setDateRange] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null); 
    const [showEditModal, setShowEditModal] = useState(false);
    const [carToEdit, setCarToEdit] = useState(null);
    
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

    const handleDateChange = (dates) => {
        setDateRange(dates); 
        if (dates.length === 2) {
            setSearchParams(prev => ({
                ...prev,
                pickupDate: dates[0].format("YYYY-MM-DD"),
                returnDate: dates[1].format("YYYY-MM-DD")
            }));
        } else {
            setSearchParams(prev => ({ ...prev, pickupDate: "", returnDate: "" }));
        }
    };
    
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setCars([]);
        
        const { city, pickupDate, returnDate, maxPrice, category } = searchParams;
        
        if (!city) { 
            setError("Please enter a city.");
            setLoading(false);
            return;
        }

        const queryParams = new URLSearchParams();
        queryParams.append('city', city);
        
        if (pickupDate) queryParams.append('pickupDate', pickupDate);
        if (returnDate) queryParams.append('returnDate', returnDate);
        if (maxPrice) queryParams.append('maxPrice', maxPrice); 
        if (category) queryParams.append('category', category); 

        const query = queryParams.toString();

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


    const handleEditCar = (carId) => {
        const car = cars.find(c => c._id === carId);
        if (car) {
            setCarToEdit(car);
            setShowEditModal(true);
        }
    };

    const handleDeleteCar = async (carId) => {
        if (!window.confirm("Are you sure you want to delete this car?")) {
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return alert("Authentication error.");

        try {
            const response = await fetch(`${apiUrl}/api/cars/${carId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to delete');
            }
            
            setCars(prevCars => prevCars.filter(car => car._id !== carId));
            alert("Car deleted successfully");

        } catch (err) {
            console.error("Error deleting car:", err);
            setError(err.message);
        }
    };

    const handleEditSubmit = async (formData, carId) => {
        const token = localStorage.getItem("token");
        if (!token) return alert("Authentication error.");
        
        setLoading(true); 

        try {
            const response = await fetch(`${apiUrl}/api/cars/${carId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData 
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update');
            }

            const updatedCar = await response.json();
            
            setCars(prevCars => prevCars.map(car => 
                car._id === updatedCar._id ? updatedCar : car
            ));
            
            setShowEditModal(false);
            setCarToEdit(null);
            alert("Car updated successfully");

        } catch (err) {
            console.error("Error updating car:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const closeModal = () => {
        setSelectedCar(null); 
        setShowEditModal(false); 
        setCarToEdit(null);
    };

    return (
        <>
            {isAuthenticated ? <UserNavbar /> : <Navbar />}
            
            <div className="offers-container"> 
                
                <div className="offers-header">
                    <h2 className="offers-title">Rent Car</h2>
                </div>
                
                <form 
                    onSubmit={handleSearch} 
                    className="offers-header" 
                    style={{ 
                        justifyContent: 'center', 
                        flexWrap: 'wrap', 
                        gap: '10px', 
                        padding: '10px',
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        marginTop: '20px' 
                    }}
                >
                    <input 
                        type="text" 
                        name="city"
                        placeholder="City" 
                        value={searchParams.city}
                        onChange={handleSearchChange}
                        required
                        className="form-input" 
                        style={{ width: 'auto', minWidth: '150px' }} 
                    />

                    <select
                        name="category"
                        value={searchParams.category}
                        onChange={handleSearchChange}
                        className="form-input"
                        style={{ width: 'auto', minWidth: '150px' }}
                    >
                        <option value="">All Categories</option>
                        {carCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    
                    <input 
                        type="text" 
                        name="maxPrice"
                        placeholder="Max Price (PLN)"
                        value={searchParams.maxPrice}
                        onChange={handleSearchChange}
                        className="form-input"
                        style={{ width: 'auto', minWidth: '150px' }}
                    />
                    

                    <div className="date-picker-container" style={{ width: 'auto', minWidth: '200px' }}>
                        <DatePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            range
                            numberOfMonths={2}
                            format="YYYY-MM-DD"
                            placeholder="Pick-up & Return Dates"
                        />
                    </div>
                    

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
                                handleEditCar={handleEditCar}
                                handleDeleteCar={handleDeleteCar}
                                searchDates={{ pickupDate: searchParams.pickupDate, returnDate: searchParams.returnDate }} 
                            />
                        ))}
                    </div>
                )}
                
                {!loading && cars.length === 0 && !searchParams.city && (
                    <p className="offers-empty">Enter a city and dates to find available cars.</p>
                )}


                {selectedCar && userRole !== "admin" && (
                    <div className="offer-modal-wrapper">
                        <CarrentBookingModal 
                            car={selectedCar}
                            userData={userData}
                            searchDates={{ pickupDate: searchParams.pickupDate, returnDate: searchParams.returnDate }}
                            closeModal={closeModal}
                        />
                    </div>
                )}

                {showEditModal && userRole === "admin" && (
                    <div className="offer-modal-wrapper"> 
                        <EditCarModal
                            carToEdit={carToEdit}
                            handleEditSubmit={handleEditSubmit}
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