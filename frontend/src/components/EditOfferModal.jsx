import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-multi-date-picker";
import plusIcon from "../assets/img/plus.png";
import LocationPicker from "./LocationPicker.js";

const EditOfferModal = ({
  offer,
  editFormData,
  setEditFormData,
  handleEditFormChange,
  handleEditSubmit,
  closeModal,
}) => {
  const [previewImages, setPreviewImages] = useState(
    editFormData.imageUrls
      ?.filter((url) => url && typeof url === "string")
      .map((url) => ({ preview: url })) || []
  );
  const [mainImageIndex, setMainImageIndex] = useState(
    editFormData.mainImageIndex || 0
  );
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [location, setLocation] = useState({
    city: editFormData.city || "",
    country: editFormData.country || "",
  });
  const [placesToVisit, setPlacesToVisit] = useState(
    editFormData.placesToVisit || [{ name: "", description: "", image: null }]
  );

  const ALL_CATEGORIES = [
    "Adventure", "Culture", "Relaxation", "Nature", "Hiking", "Skiing",
    "Beach", "History", "Nightlife", "Food", "Wildlife", "Romantic",
    "Luxury", "Budget", "Camping", "Backpacking", "Photography", "Yoga",
    "Surfing", "Diving", "Art", "Architecture", "Shopping", "Festival", "Wellness"
  ];

  useEffect(() => {
    if (offer && offer.categories) {
      const cleanedCategories = Array.isArray(offer.categories)
        ? offer.categories
            .map((cat) => cat.replace(/^"|"$/g, '').replace(/\\"/g, '').trim())
            .filter((cat) => cat && ALL_CATEGORIES.includes(cat))
        : [];
      setEditFormData((prev) => ({
        ...prev,
        categories: cleanedCategories.length > 0 ? cleanedCategories : prev.categories || [],
      }));
    }
  }, [offer, setEditFormData]);

  const handleCategoryToggle = (category) => {
    setEditFormData((prev) => {
      const selected = Array.isArray(prev.categories) ? prev.categories : [];
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

  const addPeriodDates = () => {
    if (!periodStart || !periodEnd) {
      alert("Please select both start and end dates for the period");
      return;
    }

    let startDate = periodStart.toDate ? periodStart.toDate() : new Date(periodStart);
    let endDate = periodEnd.toDate ? periodEnd.toDate() : new Date(periodEnd);

    if (endDate < startDate) {
      alert("End date must be after start date");
      return;
    }

    const durationInDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    let datesToAdd = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      datesToAdd.push(new Date(d).toISOString().split("T")[0]);
    }

    const existingDates = (editFormData.availableDates || [])
      .map((date) => {
        if (typeof date === "string") return date;
        if (date?.toDate) return date.toDate().toISOString().split("T")[0];
        if (date instanceof Date) return date.toISOString().split("T")[0];
        return null;
      })
      .filter((date) => date !== null);

    const allDatesSet = new Set([...existingDates, ...datesToAdd]);

    setEditFormData((prev) => ({
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
    setEditFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...files],
    }));

    if (mainImageIndex === null && newImages.length > 0) {
      setMainImageIndex(previewImages.length);
    }
  };

  const setMainImage = (index) => {
    setMainImageIndex(index);
    setEditFormData((prev) => ({
      ...prev,
      mainImageIndex: index,
    }));
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setEditFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || [],
    }));

    if (mainImageIndex === index) {
      setMainImageIndex(null);
    } else if (mainImageIndex !== null && index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handlePlaceChange = (index, field, value) => {
    const newPlaces = [...placesToVisit];
    newPlaces[index][field] = value;
    setPlacesToVisit(newPlaces);
    setEditFormData((prev) => ({ ...prev, placesToVisit: newPlaces }));
  };

  const addPlace = () => {
    setPlacesToVisit([...placesToVisit, { name: "", description: "", image: null }]);
  };

  const removePlace = (index) => {
    if (placesToVisit.length === 1) {
      alert("At least one place to visit is required.");
      return;
    }
    const newPlaces = placesToVisit.filter((_, i) => i !== index);
    setPlacesToVisit(newPlaces);
    setEditFormData((prev) => ({ ...prev, placesToVisit: newPlaces }));
  };

  const handlePlaceImageChange = (index, file) => {
    const newPlaces = [...placesToVisit];
    newPlaces[index].image = file;
    setPlacesToVisit(newPlaces);
    setEditFormData((prev) => ({ ...prev, placesToVisit: newPlaces }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (editFormData._id) {
      formData.append("_id", editFormData._id);
    }

    if (!editFormData.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!editFormData.description.trim()) {
      alert("Description is required.");
      return;
    }
    if (!editFormData.city.trim()) {
      alert("City is required.");
      return;
    }
    if (!editFormData.country.trim()) {
      alert("Country is required.");
      return;
    }
    if (!editFormData.price || isNaN(editFormData.price) || editFormData.price <= 0) {
      alert("Price must be a valid positive number.");
      return;
    }
    if (!editFormData.duration || isNaN(editFormData.duration) || editFormData.duration <= 0) {
      alert("Duration must be a valid positive number.");
      return;
    }
    if (!editFormData.availableDates || editFormData.availableDates.length === 0) {
      alert("At least one available date is required.");
      return;
    }
    if (!editFormData.categories || editFormData.categories.length < 1) {
      alert("Select at least one category.");
      return;
    }
    if (
      (!editFormData.images || editFormData.images.length === 0) &&
      (!editFormData.imageUrls || editFormData.imageUrls.length === 0)
    ) {
      alert("At least one image is required.");
      return;
    }
    if (mainImageIndex === null) {
      alert("Please select a main image.");
      return;
    }
    if (!placesToVisit.some((place) => place.name.trim())) {
      alert("At least one place to visit with a valid name is required.");
      return;
    }

    formData.append("title", editFormData.title);
    formData.append("description", editFormData.description);
    formData.append("price", editFormData.price);
    formData.append("duration", editFormData.duration);
    formData.append("city", editFormData.city);
    formData.append("country", editFormData.country);
    formData.append("categories", JSON.stringify(editFormData.categories || []));
    formData.append("availableDates", JSON.stringify(editFormData.availableDates || []));
    formData.append(
      "placesToVisit",
      JSON.stringify(placesToVisit.map(({ name, description }) => ({ name, description })))
    );
    formData.append("mainImageIndex", mainImageIndex);
    if (editFormData.images) {
      editFormData.images.forEach((image) => {
        formData.append("images", image);
      });
    }
    placesToVisit.forEach((place, index) => {
      if (place.image) {
        formData.append("placeImages", place.image);
      }
    });
    if (editFormData.imageUrls) {
      formData.append("imageUrls", JSON.stringify(editFormData.imageUrls));
    }

    handleEditSubmit(formData);
  };

  useEffect(() => {
    if (location.city && location.country) {
      setEditFormData((prev) => ({
        ...prev,
        city: location.city,
        country: location.country,
      }));
    }
  }, [location, setEditFormData]);

  return (
    <div className="modal-overlay">
      <div className="modal modal-add">
        <div className="modal-header">
          <h3 className="modal-title">
            Edit Offer: {offer?.title || "Selected Offer"}
          </h3>
          <button className="modal-close" onClick={closeModal}>×</button>
        </div>
        <div className="modal-body">
          <form id="offer-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Title:</label>
              <input
                className="form-input"
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditFormChange}
                required
                placeholder="Enter title"
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
                    className={`category-chip ${editFormData.categories?.includes(category) ? "selected" : ""}`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Pick Location:</label>
              <LocationPicker
                setCityCountry={setLocation}
                initialCity={editFormData.city}
                initialCountry={editFormData.country}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Places to Visit:</label>
              {placesToVisit.map((place, index) => (
                <div key={index} className="form-group place-group">
                  <input
                    type="text"
                    value={place.name}
                    onChange={(e) => handlePlaceChange(index, "name", e.target.value)}
                    placeholder="Place Name"
                    required
                    className="form-input"
                  />
                  <textarea
                    value={place.description}
                    onChange={(e) => handlePlaceChange(index, "description", e.target.value)}
                    placeholder="Place Description"
                    className="form-input form-textarea"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePlaceImageChange(index, e.target.files[0])}
                    className="form-input"
                  />
                  {placesToVisit.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removePlace(index)}
                    >
                      Remove Place
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-icon-only"
                onClick={addPlace}
                title="Add Place"
              >
                <img src={plusIcon} alt="Add" style={{ width: "35px", height: "35px" }} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (days):</label>
              <input
                className="form-input"
                type="number"
                name="duration"
                value={editFormData.duration}
                readOnly
                placeholder="Number of days"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Available Dates (manual selection):</label>
              <div className="date-picker-container">
                <DatePicker
                  multiple
                  format="YYYY-MM-DD"
                  value={editFormData.availableDates}
                  onChange={(dates) => {
                    const formattedDates = dates.map((d) =>
                      d?.toDate ? d.toDate().toISOString().split("T")[0] : d
                    );
                    setEditFormData((prev) => ({
                      ...prev,
                      availableDates: formattedDates,
                    }));
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Add Date Period (includes duration):</label>
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
                  <img src={plusIcon} alt="Add" style={{ width: "35px", height: "35px" }} />
                </button>
              </div>
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
                  {previewImages.map((img, index) =>
                    img.preview && img.preview.trim() !== "" ? (
                      <div key={index} className="image-preview-wrapper">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className={`preview-image ${mainImageIndex === index ? "main-image" : ""}`}
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
                    ) : null
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
        <div className="modal-footer sticky-footer my-modal">
          <span className="modal-price">{editFormData.price || 0} PLN</span>
          <div className="buttons-group">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" form="offer-form" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EditOfferModal.propTypes = {
  offer: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.number,
    city: PropTypes.string,
    country: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    availableDates: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    ),
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    mainImageIndex: PropTypes.number,
    placesToVisit: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.any,
      })
    ),
  }).isRequired,
  editFormData: PropTypes.shape({
    _id: PropTypes.string,
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
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    mainImageIndex: PropTypes.number,
    placesToVisit: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.any,
      })
    ),
  }).isRequired,
  setEditFormData: PropTypes.func.isRequired,
  handleEditFormChange: PropTypes.func.isRequired,
  handleEditSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default EditOfferModal;