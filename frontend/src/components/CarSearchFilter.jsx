import React, { useState } from "react";
import DatePicker from "react-multi-date-picker"; 
import { FaSearch, FaTag, FaDollarSign, FaCalendarAlt } from "react-icons/fa";
import "../assets/styles/CarSearchFilter.css";

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

const CarSearchFilter = ({ onSearch, initialParams }) => {
    const [localParams, setLocalParams] = useState({
        city: initialParams.city || "",
        category: initialParams.category || "",
        maxPrice: initialParams.maxPrice || "",
    });
    const [dateRange, setDateRange] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalParams(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let datesObj = {};
        if (dateRange.length === 2) {
            datesObj = {
                pickupDate: dateRange[0].format("YYYY-MM-DD"),
                returnDate: dateRange[1].format("YYYY-MM-DD")
            };
        }

        onSearch({ ...localParams, ...datesObj });
    };

    return (
        <div className="car-search-container">
            <h3>Smart car rentals, made simple!</h3>
            <p className="car-search-subtitle">
                Find reliable vehicles, clear pricing, and flexible pickup options — all in one place. Travel with confidance and control.
            </p>

            <form className="car-search-bar" onSubmit={handleSubmit}>
                
                <div className="car-input-wrapper">
                    <FaSearch className="car-input-icon" />
                    <input 
                        type="text" 
                        name="city"
                        placeholder="City, Country" 
                        value={localParams.city}
                        onChange={handleChange}
                        className="car-search-input"
                    />
                </div>

                <div className="car-input-wrapper">
                    <FaTag className="car-input-icon" />
                    <select
                        name="category"
                        value={localParams.category}
                        onChange={handleChange}
                        className="car-search-select"
                    >
                        <option value="">All Categories</option>
                        {carCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                
                <div className="car-input-wrapper" style={{ flex: '0.6' }}>
                    <FaDollarSign className="car-input-icon" />
                    <input 
                        type="text" 
                        name="maxPrice"
                        placeholder="Price"
                        value={localParams.maxPrice}
                        onChange={handleChange}
                        className="car-search-input"
                    />
                </div>
                
                <div className="car-input-wrapper">
                    <FaCalendarAlt className="car-input-icon" />
                    <div className="car-datepicker-wrapper">
                        <DatePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            range
                            numberOfMonths={2}
                            format="YYYY-MM-DD"
                            placeholder="Date"
                            style={{ border: 'none', boxShadow: 'none' }} 
                        />
                    </div>
                </div>
                
                <button type="submit" className="car-search-button">
                    Search
                </button>
            </form>
        </div>
    );
};

export default CarSearchFilter;