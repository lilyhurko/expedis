import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-multi-date-picker";
import plusIcon from "../assets/img/plus.png";
import LocationPicker from "./LocationPicker.js";

const AddOfferModal = ({
  newOfferData,
  setNewOfferData,
  handleNewOfferChange,
  handleAddOfferSubmit,
  closeModal,
}) => {
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [location, setLocation] = useState({ city: "", country: "" });
  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(null);

  const addPeriodDates = () => {
    if (!periodStart || !periodEnd) {
      alert("Please select both start and end dates for the period");
      return;
    }

    let startDate = periodStart.toDate
      ? periodStart.toDate()
      : new Date(periodStart);
    let endDate = periodEnd.toDate ? periodEnd.toDate() : new Date(periodEnd);

    if (endDate < startDate) {
      alert("End date must be after start date");
      return;
    }

    const durationInDays =
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    let datesToAdd = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      datesToAdd.push(new Date(d).toISOString().split("T")[0]);
    }

    const existingDates = (newOfferData.availableDates || [])
      .map((date) => {
        if (typeof date === "string") return date;
        if (date?.toDate) return date.toDate().toISOString().split("T")[0];
        if (date instanceof Date) return date.toISOString().split("T")[0];
        return null;
      })
      .filter((date) => date !== null);

    const allDatesSet = new Set([...existingDates, ...datesToAdd]);

    setNewOfferData((prev) => ({
      ...prev,
      availableDates: Array.from(allDatesSet),
      duration: durationInDays,
    }));

    setPeriodStart(null);
    setPeriodEnd(null);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (previewImages.length + files.length > 15) {
      alert("You can upload a maximum of 15 images.");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviewImages((prev) => [...prev, ...newImages]);
    setNewOfferData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...files],
    }));

    // Set first image as main if none is selected
    if (mainImageIndex === null && newImages.length > 0) {
      setMainImageIndex(previewImages.length);
    }
  };

  const setMainImage = (index) => {
    setMainImageIndex(index);
    setNewOfferData((prev) => ({
      ...prev,
      mainImageIndex: index,
    }));
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setNewOfferData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    if (mainImageIndex === index) {
      setMainImageIndex(null);
    } else if (mainImageIndex !== null && index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newOfferData.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!newOfferData.description.trim()) {
      alert("Description is required.");
      return;
    }
    if (!newOfferData.city.trim()) {
      alert("City is required.");
      return;
    }
    if (!newOfferData.country.trim()) {
      alert("Country is required.");
      return;
    }
    if (
      !newOfferData.price ||
      isNaN(newOfferData.price) ||
      newOfferData.price <= 0
    ) {
      alert("Price must be a valid positive number.");
      return;
    }
    if (
      !newOfferData.duration ||
      isNaN(newOfferData.duration) ||
      newOfferData.duration <= 0
    ) {
      alert("Duration must be a valid positive number.");
      return;
    }
    if (
      !newOfferData.availableDates ||
      newOfferData.availableDates.length === 0
    ) {
      alert("At least one available date is required.");
      return;
    }
    if (
      !newOfferData.categories ||
      newOfferData.categories.length < 1
    ) {
      alert("Select at least one category.");
      return;
    }
    if (!newOfferData.images || newOfferData.images.length === 0) {
      alert("At least one image is required.");
      return;
    }
    if (mainImageIndex === null) {
      alert("Please select a main image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newOfferData.title);
    formData.append("description", newOfferData.description);
    formData.append("price", newOfferData.price);
    formData.append("duration", newOfferData.duration);
    formData.append("city", newOfferData.city);
    formData.append("country", newOfferData.country);
    formData.append(
      "categories",
      JSON.stringify(newOfferData.categories || [])
    );
    formData.append(
      "availableDates",
      JSON.stringify(newOfferData.availableDates || [])
    );
    newOfferData.images.forEach((image, index) => {
      formData.append("images", image);
    });
    formData.append("mainImageIndex", mainImageIndex);

    handleAddOfferSubmit(formData);
  };

  useEffect(() => {
    if (location.city && location.country) {
      setNewOfferData((prev) => ({
        ...prev,
        city: location.city,
        country: location.country,
      }));
    }
  }, [location, setNewOfferData]);

  const handleCategoryToggle = (category) => {
    setNewOfferData((prev) => {
      const selected = prev.categories || [];
      if (selected.includes(category)) {
        return { ...prev, categories: selected.filter((c) => c !== category) };
      } else if (selected.length < 5) {
        return { ...prev, categories: [...selected, category] };
      } else {
        alert("You can select up to 5 categories.");
        return prev;
      }
    });
  };

  const ALL_CATEGORIES = [
    "Adventure",
    "Culture",
    "Relaxation",
    "Nature",
    "Hiking",
    "Skiing",
    "Beach",
    "History",
    "Nightlife",
    "Food",
    "Wildlife",
    "Romantic",
    "Luxury",
    "Budget",
    "Camping",
    "Backpacking",
    "Photography",
    "Yoga",
    "Surfing",
    "Diving",
    "Art",
    "Architecture",
    "Shopping",
    "Festival",
    "Wellness",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Add New Offer</h3>
          <button className="modal-close" onClick={closeModal}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form id="offer-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Title:</label>
              <input
                className="form-input"
                type="text"
                name="title"
                value={newOfferData.title}
                onChange={handleNewOfferChange}
                required
                placeholder="Enter title"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea
                className="form-input"
                name="description"
                value={newOfferData.description}
                onChange={handleNewOfferChange}
                required
                placeholder="Enter description"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Categories (select 1 to 5):</label>
              <div className="category-list">
                {ALL_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`category-chip ${
                      newOfferData.categories?.includes(category)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Pick Location:</label>
              <LocationPicker setCityCountry={setLocation} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (days):</label>
              <input
                className="form-input"
                type="number"
                name="duration"
                value={newOfferData.duration}
                onChange={handleNewOfferChange}
                min="1"
                placeholder="Number of days"
                readOnly
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Available Dates (manual selection):
              </label>
              <div className="date-picker-container">
                <DatePicker
                  multiple
                  value={newOfferData.availableDates}
                  onChange={(dates) =>
                    setNewOfferData((prev) => ({
                      ...prev,
                      availableDates: (dates || []).map((d) =>
                        d?.toDate ? d.toDate().toISOString().split("T")[0] : d
                      ),
                    }))
                  }
                  format="YYYY-MM-DD"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Add Date Period (includes duration):
              </label>
              <div className="date-period-container">
                <div className="date-picker-container">
                  <DatePicker
                    value={periodStart}
                    onChange={setPeriodStart}
                    format="YYYY-MM-DD"
                    placeholder="Start date"
                    className="form-input"
                  />
                </div>
                <div className="date-picker-container">
                  <DatePicker
                    value={periodEnd}
                    onChange={setPeriodEnd}
                    format="YYYY-MM-DD"
                    placeholder="End date"
                    className="form-input"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-icon-only"
                  onClick={addPeriodDates}
                  title="Add Period"
                >
                  <img
                    src={plusIcon}
                    alt="Add"
                    style={{ width: "35px", height: "35px" }}
                  />
                </button>
              </div>
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
                step="0.01"
                placeholder="Enter price in PLN"
              />
            </div>
            <div className="form-group image-upload-group">
              <label className="form-label">Upload Images (up to 15):</label>
              <input
                className="form-input"
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              {previewImages.length > 0 && (
                <div className="image-preview-container">
                  {previewImages.map((img, index) => (
                    <div key={index} className="image-preview-wrapper">
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className={`preview-image ${
                          mainImageIndex === index ? "main-image" : ""
                        }`}
                        onClick={() => setMainImage(index)}
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                      {mainImageIndex === index && (
                        <span className="main-image-label">Main</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="modal-footer sticky-footer my-modal">
          <span className="modal-price">{newOfferData.price || 0} PLN</span>
          <div className="buttons-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button type="submit" form="offer-form" className="btn btn-primary">
              Add Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AddOfferModal.propTypes = {
  newOfferData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    city: PropTypes.string,
    country: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    availableDates: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    ),
    images: PropTypes.arrayOf(PropTypes.instanceOf(File)),
    mainImageIndex: PropTypes.number,
  }).isRequired,
  setNewOfferData: PropTypes.func.isRequired,
  handleNewOfferChange: PropTypes.func.isRequired,
  handleAddOfferSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default AddOfferModal;