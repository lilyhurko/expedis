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
    "Sedan (Executive)"
];

const AddCarModal = ({
  carData,
  setCarData,
  onSubmit,
  closeModal,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
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
    if (
      !carData.make ||
      !carData.model ||
      !carData.category ||
      !carData.pricePerDay ||
      !carData.city ||
      !carData.country
    ) {
      setError("Please fill in all required fields!");
      return;
    }

    onSubmit();
  };

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
            <div style={{ color: "#d32f2f", marginBottom: "15px", fontWeight: "500" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Make *</label>
              <input
                className="form-input"
                type="text"
                name="make"
                value={carData.make || ""}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                className="form-input"
                type="text"
                name="model"
                value={carData.model || ""}
                onChange={handleChange}
                placeholder="e.g. Corolla"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                name="category"
                value={carData.category || ""}
                onChange={handleChange}
                required
                style={{
                  padding: "12px 14px",
                  fontSize: "16px",
                  appearance: "none",
                  background: "white url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e\") no-repeat right 12px center",
                  backgroundSize: "12px",
                }}
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
              <label className="form-label">Year</label>
              <input
                className="form-input"
                type="number"
                name="year"
                value={carData.year || ""}
                onChange={handleChange}
                min="1990"
                max="2030"
                placeholder="e.g. 2023"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price per Day (PLN) *</label>
              <input
                className="form-input"
                type="number"
                name="pricePerDay"
                value={carData.pricePerDay || ""}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
                placeholder="e.g. 189.99"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                className="form-input"
                type="text"
                name="city"
                value={carData.city || ""}
                onChange={handleChange}
                placeholder="e.g. Kraków"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country *</label>
              <input
                className="form-input"
                type="text"
                name="country"
                value={carData.country || ""}
                onChange={handleChange}
                placeholder="e.g. Poland"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-input form-textarea"
                name="description"
                value={carData.description || ""}
                onChange={handleChange}
                rows="4"
                placeholder="Air conditioning, automatic transmission, 5 seats..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Car Photo *</label>
              <input
                type="file"
                accept="image/*"
                name="image"
                onChange={handleChange}
                required
              />
              {previewImage && (
                <div style={{ marginTop: "15px", textAlign: "center" }}>
                  <img
                    src={previewImage}
                    alt="Car preview"
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      maxHeight: "320px",
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

        <div className={`${styles.modalFooter} ${styles.stickyFooter}`}>
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