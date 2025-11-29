import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "../assets/styles/Modals.module.css";
import "../assets/styles/Offerts.css";

const EditCarModal = ({ carToEdit, handleEditSubmit, closeModal }) => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    pricePerDay: "",
    city: "",
    country: "",
    description: "",
    image: null,
    imageUrl: "", 
  });
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'; 

  const [previewImage, setPreviewImage] = useState("");
  const [error, setError] = useState("");
  const isInitialized = useRef(false);

  useEffect(() => {
    if (carToEdit && !isInitialized.current) {
      isInitialized.current = true;

      const imageUrl = carToEdit.imageUrl?.startsWith("http")
        ? carToEdit.imageUrl
        : carToEdit.imageUrl
        ? `${apiUrl}${carToEdit.imageUrl.startsWith("/") ? "" : "/"}${carToEdit.imageUrl}`
        : "";

      setFormData({
        make: carToEdit.make || "",
        model: carToEdit.model || "",
        year: carToEdit.year || "",
        pricePerDay: carToEdit.pricePerDay || "",
        city: carToEdit.city || "",
        country: carToEdit.country || "",
        description: carToEdit.description || "",
        image: null,
        imageUrl: imageUrl,
      });

      setPreviewImage(imageUrl);
    }
  }, [carToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null, imageUrl: "" }));
    setPreviewImage("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.make || !formData.model || !formData.pricePerDay || !formData.city) {
      setError("Please fill in all required fields.");
      return;
    }

    const submitData = new FormData();
    submitData.append("_id", carToEdit._id);
    submitData.append("make", formData.make);
    submitData.append("model", formData.model);
    submitData.append("year", formData.year);
    submitData.append("pricePerDay", formData.pricePerDay);
    submitData.append("city", formData.city);
    submitData.append("country", formData.country || "Poland");
    submitData.append("description", formData.description);

    if (formData.image) {
      submitData.append("image", formData.image);
    }

    if (!formData.image && !formData.imageUrl) {
      submitData.append("removeImage", "true");
    }

    try {
      await handleEditSubmit(submitData, carToEdit._id);
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to update car.");
    }
  };

  return (
    <div className={`${styles.modalOverlay} ${styles.offerModalWrapper}`}>
      <div className={`${styles.modal} ${styles.modalAdd}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            Edit Car: {carToEdit?.make} {carToEdit?.model}
          </h3>
          <button className={styles.modalClose} onClick={closeModal}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "15px" }}>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} id="edit-car-form">
            <div className="form-group">
              <label className="form-label">Make:</label>
              <input
                className="form-input"
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model:</label>
              <input
                className="form-input"
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year:</label>
              <input
                className="form-input"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1886"
                max="2030"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price per Day (PLN):</label>
              <input
                className="form-input"
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City:</label>
              <input
                className="form-input"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country (optional):</label>
              <input
                className="form-input"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Poland"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea
                className="form-input form-textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-group image-upload-group">
              <label className="form-label">Car Photo:</label>

              {previewImage && (
                <div className="image-preview-container" style={{ marginBottom: "15px" }}>
                  <div className="image-preview-wrapper" style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={previewImage}
                      alt="Car preview"
                      style={{ width: "300px", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(220, 38, 38, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <label className="form-label-file">
                <span className="btn-file-dummy">
                  {formData.image ? formData.image.name : "Select New Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input-hidden"
                />
              </label>
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
              form="edit-car-form"
              className={`btn ${styles.btnPrimary}`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EditCarModal.propTypes = {
  carToEdit: PropTypes.object.isRequired,
  handleEditSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default EditCarModal;