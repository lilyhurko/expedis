import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "../assets/styles/Modals.module.css";

const carCategories = [
  "Sedan (Compact)",
  "SUV/Crossover",
  "Sedan",
  "Sedan (Grand Turismo)",
  "SUV/Crossover (Coupe)",
  "Hatchback",
  "Sedan (Luxury)",
  "Sedan (Executive)",
];

const AddCarModal = ({ carData, setCarData, onSubmit, closeModal }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setCarData((prev) => ({ ...prev, [name]: file }));
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setCarData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const required = ["make", "model", "category", "pricePerDay", "city", "country", "image"];
    const missing = required.filter((field) => !carData[field]);

    if (missing.length > 0) {
      setError("Please fill in all required fields and upload a car photo.");
      return;
    }

    onSubmit();
  };

  const dailyPrice = carData.pricePerDay ? Number(carData.pricePerDay).toFixed(2) : "0.00";
  return (
    <div className={`${styles.modalOverlay} ${styles.offerModalWrapper}`}>
      <div className={`${styles.modal} ${styles.modalAdd}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add New Car</h3>
          <button
            className={styles.modalClose}
            onClick={closeModal}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "16px", fontWeight: "500" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Make:</label>
              <input
                className="form-input"
                type="text"
                name="make"
                value={carData.make || ""}
                onChange={handleChange}
                placeholder="Enter make"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model:</label>
              <input
                className="form-input"
                type="text"
                name="model"
                value={carData.model || ""}
                onChange={handleChange}
                placeholder="Enter model"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category:</label>
              <select
                className="form-input"
                name="category"
                value={carData.category || ""}
                onChange={handleChange}
                required
              >
                <option value="">— Select category —</option>
                {carCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year:</label>
              <input
                className="form-input"
                type="number"
                name="year"
                value={carData.year || ""}
                onChange={handleChange}
                min="2000"
                max="2025"
                placeholder="Enter year"
                style={{ MozAppearance: "textfield" }}
                onWheel={(e) => e.target.blur()}
              />
              <style jsx>{`
                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
              `}</style>
            </div>

            <div className="form-group">
              <label className="form-label">Price per Day (PLN):</label>
              <input
                className="form-input"
                type="number"
                name="pricePerDay"
                value={carData.pricePerDay || ""}
                onChange={handleChange}
                min="1"
                step="0.10"
                placeholder="Enter price per day"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City:</label>
              <input
                className="form-input"
                type="text"
                name="city"
                value={carData.city || ""}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country:</label>
              <input
                className="form-input"
                type="text"
                name="country"
                value={carData.country || ""}
                onChange={handleChange}
                placeholder="Enter country"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea
                className="form-input form-textarea"
                name="description"
                value={carData.description || ""}
                onChange={handleChange}
                rows="4"
                placeholder="Enter description"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Car Photo:</label>
              <input
                type="file"
                accept="image/*"
                name="image"
                onChange={handleChange}
                required
                style={{ marginBottom: "12px" }}
              />

              {previewImage && (
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <img
                    src={previewImage}
                    alt="Car preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        <div className={`${styles.modalFooter} ${styles.stickyFooter} ${styles.myModal}`}>
          <span className={styles.modalPrice}>
            {dailyPrice} PLN <small>/ per day</small>
          </span>

          <div className={styles.buttonsGroup}>
            <button
              type="button"
              className={`btn ${styles.btnSecondary}`}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${styles.btnPrimary}`}
              onClick={handleSubmit}
            >
              Add Car
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AddCarModal.propTypes = {
  carData: PropTypes.object.isRequired,
  setCarData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default AddCarModal;