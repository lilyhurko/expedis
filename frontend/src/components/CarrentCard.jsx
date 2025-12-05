import React from "react";
import { FaEdit, FaTrash, FaCity, FaCar, FaCalendarAlt } from "react-icons/fa";
import styles from "../assets/styles/OfferCard.module.css";

const CarrentCard = ({
  car,
  userRole,
  handleBookNow,
  handleEditCar,
  handleDeleteCar,
  searchDates,
}) => {
  const isAdmin = userRole === "admin";

  let diffDays = 0;
  if (searchDates?.pickupDate && searchDates?.returnDate) {
    const start = new Date(searchDates.pickupDate);
    const end = new Date(searchDates.returnDate);
    diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  }

  const totalPrice = diffDays > 0 ? car.pricePerDay * diffDays : car.pricePerDay;
  const totalPriceDisplay = diffDays > 0 
    ? `${totalPrice.toFixed(2)} PLN` 
    : `${car.pricePerDay.toFixed(2)} PLN / day`;

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; 

  const buildImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http")) return filename;
    return `${apiUrl}${filename.startsWith("/") ? "" : "/"}${filename}`;
  };

  return (
    <div className={styles.offerCard} style={{ position: "relative" }}>
      {isAdmin && (
        <div className={styles.adminActions}>
          <button className={styles.editIconButton} onClick={(e) => handleActionClick(e, () => handleEditCar(car._id))}>
            <FaEdit className={styles.editIcon} />
          </button>
          <button className={styles.deleteIconButton} onClick={(e) => handleActionClick(e, () => handleDeleteCar(car._id))}>
            <FaTrash className={styles.deleteIcon} />
          </button>
        </div>
      )}

      <div className={styles.imageWrapper}>
        {buildImageUrl(car.imageUrl) ? (
          <img src={buildImageUrl(car.imageUrl)} alt={`${car.make} ${car.model}`} className={styles.offerImage} />
        ) : (
          <div className={styles.noImagePlaceholder}>No Car Image</div>
        )}
      </div>

      <div className={styles.offerContent}>
        <p className={styles.offerLocation}>
          <FaCity /> {car.city}, {car.country || "Poland"}
        </p>
        <h3 className={styles.offerTitle}>{car.make} {car.model} ({car.year})</h3>

        <div style={{ margin: "8px 0", fontSize: "0.9rem", color: "#555" }}>
          <p><FaCar /> <strong>Per Day:</strong> {car.pricePerDay.toFixed(2)} PLN</p>
          {diffDays > 0 && <p><FaCalendarAlt /> <strong>Duration:</strong> {diffDays} days</p>}
        </div>

        <div className={styles.offerFooter}>
          <span className={styles.offerPrice}>{totalPriceDisplay}</span>
          <div className={styles.offerActions}>
            {!isAdmin && (
              <button
                className="book-now-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookNow(car._id); 
                }}
              >
                {diffDays > 0 ? "Rent Car" : "Select Dates First"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarrentCard;