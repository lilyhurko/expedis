import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-multi-date-picker";
import plusIcon from "../assets/img/plus.png";
import LocationPicker from "./LocationPicker.js";
import AirportSelect from "./AirportSelect.js";



const AddOfferModal = ({
  newOfferData,
  setNewOfferData,
  handleNewOfferChange,
  handleAddOfferSubmit,
  closeModal,
}) => {
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);

  const [location, setLocation] = useState({
    city: "",
    country: "",
    lat: null,
    lng: null,
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(null);
  const [placesToVisit, setPlacesToVisit] = useState([
    { name: "", description: "", image: null },
  ]);
  const [flightConnections, setFlightConnections] = useState([
    {
      departureAirportIATA: "",
      arrivalAirportIATA: "",
      departureTime: "",
      arrivalTime: "",
      flightType: "outbound",
    },
    {
      departureAirportIATA: "",
      arrivalAirportIATA: "",
      departureTime: "",
      arrivalTime: "",
      flightType: "return",
    },
  ]);
  const [error, setError] = useState(null);

  const addPeriodDates = () => {
    if (!periodStart || !periodEnd) {
      setError("Please select both start and end dates.");
      return;
    }

    let startDate = periodStart.toDate
      ? periodStart.toDate()
      : new Date(periodStart);
    let endDate = periodEnd.toDate ? periodEnd.toDate() : new Date(periodEnd);

    startDate = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      )
    );
    endDate = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    );

    if (endDate < startDate) {
      setError("End date must be after start date.");
      return;
    }

    const tripDurationInDays =
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const startDateString = startDate.toISOString().split("T")[0];

    const existingDates = (newOfferData.availableDates || []).map((date) => {
      if (typeof date === "string") return date;
      if (date?.toDate) return date.toDate().toISOString().split("T")[0];
      if (date instanceof Date) return date.toISOString().split("T")[0];
      return null;
    }).filter((date) => date !== null);

    const currentDuration = newOfferData.duration || 0;

    if (currentDuration === 0) {
      setNewOfferData((prev) => ({
        ...prev,
        duration: tripDurationInDays,
        availableDates: [...existingDates, startDateString].sort(),
      }));
      setError(null);
    } else {
      if (tripDurationInDays !== currentDuration) {
        setError(
          `Duration mismatch: All periods must be ${currentDuration} days. This period is ${tripDurationInDays} days.`
        );
        return; 
      }
      
      const allDatesSet = new Set([...existingDates, startDateString]);
      const sortedDates = Array.from(allDatesSet).sort();
      
      setNewOfferData((prev) => ({
        ...prev,
        availableDates: sortedDates,
      }));
      setError(null);
    }

    setPeriodStart(null);
    setPeriodEnd(null);
  };

 
  const {
      handleFlightChange, handlePlaceChange, addPlace, removePlace,
      handlePlaceImageChange, handleImageChange, setMainImage, removeImage,
      handleCategoryToggle, validateForm, onSubmit,
    } = {
      handleFlightChange: (index, field, value) => {
        const updatedConnections = [...flightConnections];
        updatedConnections[index] = { ...updatedConnections[index], [field]: value };
        setFlightConnections(updatedConnections);
        setNewOfferData(prev => ({ ...prev, flightConnections: updatedConnections, ...(field === "departureAirportIATA" && index === 0 ? { departureAirportIATA: value } : {}) }));
      },
      handlePlaceChange: (index, field, value) => {
        const newPlaces = [...placesToVisit];
        newPlaces[index][field] = value;
        setPlacesToVisit(newPlaces);
        setNewOfferData(prev => ({ ...prev, placesToVisit: newPlaces }));
      },
      addPlace: () => setPlacesToVisit([...placesToVisit, { name: "", description: "", image: null }]),
      removePlace: (index) => {
        if (placesToVisit.length === 1) { setError("At least one place to visit is required."); return; }
        const newPlaces = placesToVisit.filter((_, i) => i !== index);
        setPlacesToVisit(newPlaces);
        setNewOfferData(prev => ({ ...prev, placesToVisit: newPlaces }));
      },
      handlePlaceImageChange: (index, file) => {
        const newPlaces = [...placesToVisit];
        newPlaces[index].image = file;
        setPlacesToVisit(newPlaces);
      },
      handleImageChange: (e) => {
        const files = Array.from(e.target.files);
        if (previewImages.length + files.length > 15) { setError("You can upload a maximum of 15 images."); return; }
        const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setPreviewImages(prev => [...prev, ...newImages]);
        setNewOfferData(prev => ({ ...prev, images: [...(prev.images || []), ...files] }));
        if (mainImageIndex === null && newImages.length > 0) {
          setMainImageIndex(0);
        }
      },
      setMainImage: (index) => {
        setMainImageIndex(index);
        setNewOfferData(prev => ({ ...prev, mainImageIndex: index }));
      },
      removeImage: (index) => {
        setPreviewImages(prev => {
          const newPreviews = prev.filter((_, i) => i !== index);
          if(prev[index]) URL.revokeObjectURL(prev[index].preview);
          return newPreviews;
        });
        setNewOfferData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }));
        if (mainImageIndex === index) {
          setMainImageIndex(null);
        } else if (mainImageIndex !== null && index < mainImageIndex) {
          setMainImageIndex(mainImageIndex - 1);
        }
      },
      handleCategoryToggle: (category) => {
        setNewOfferData(prev => {
          const selected = prev.categories || [];
          if (selected.includes(category)) {
            return { ...prev, categories: selected.filter(c => c !== category) };
          } else if (selected.length < 5) {
            return { ...prev, categories: [...selected, category] };
          } else {
            setError("You can select up to 5 categories.");
            return prev;
          }
        });
      },
      validateForm: () => {  return null; },
      onSubmit: async (e) => {
        e.preventDefault();
        setError(null);
        const validationError = validateForm();
        if (validationError) {
          setError(validationError);
          return;
        }
        const formData = new FormData();
        formData.append("title", newOfferData.title);
        formData.append("description", newOfferData.description);
        formData.append("price", newOfferData.price);
        formData.append("duration", newOfferData.duration);
        formData.append("city", newOfferData.city);
        formData.append("country", newOfferData.country);
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);
        formData.append("departureAirportIATA", newOfferData.departureAirportIATA);
        formData.append("categories", JSON.stringify(newOfferData.categories || []));
        formData.append("availableDates", JSON.stringify(newOfferData.availableDates || []));
        formData.append("placesToVisit", JSON.stringify(placesToVisit.map(({ name, description }) => ({ name, description }))));
        formData.append("flightConnections", JSON.stringify(newOfferData.flightConnections || []));
        (newOfferData.images || []).forEach((image) => formData.append("images", image));
        placesToVisit.forEach((place) => { if (place.image) formData.append("placeImages", place.image); });
        formData.append("mainImageIndex", mainImageIndex);
        try {
          await handleAddOfferSubmit(formData);
          closeModal();
        } catch (err) {
          setError(err.message || "Failed to add offer. Please try again.");
        }
      },
  };
  // END: Скорочені функції

  useEffect(() => {
    if (location.city && location.country) {
      setNewOfferData((prev) => ({
        ...prev,
        city: location.city,
        country: location.country,
        departureAirportIATA: "",
        flightConnections: [
          { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "outbound" },
          { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "return" },
        ],
      }));
      setFlightConnections([
        { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "outbound" },
        { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "return" },
      ]);
    }
  }, [location, setNewOfferData]);

  const ALL_CATEGORIES = [
    "Adventure", "Culture", "Relaxation", "Nature", "Hiking", "Skiing", "Beach",
    "History", "Nightlife", "Food", "Wildlife", "Romantic", "Luxury", "Budget",
    "Camping", "Backpacking", "Photography", "Yoga", "Surfing", "Diving", "Art",
    "Architecture", "Shopping", "Festival", "Wellness",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Add New Offer</h3>
          <button
            className="modal-close"
            onClick={closeModal}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div
              className="error-message"
              style={{ color: "red", marginBottom: "10px" }}
            >
              {error}
            </div>
          )}
          <form id="offer-form" onSubmit={onSubmit}>
            
            <div className="form-group"><label className="form-label">Title:</label><input className="form-input" type="text" name="title" value={newOfferData.title || ""} onChange={handleNewOfferChange} required placeholder="Enter title" /></div>
            <div className="form-group"><label className="form-label">Description:</label><textarea className="form-input" name="description" value={newOfferData.description || ""} onChange={handleNewOfferChange} required placeholder="Enter description" /></div>
            <div className="form-group"><label className="form-label">Categories (select 1 to 5):</label><div className="category-list">{ALL_CATEGORIES.map((category) => (<button key={category} type="button" className={`category-chip ${ newOfferData.categories?.includes(category) ? "selected" : "" }`} onClick={() => handleCategoryToggle(category)}>{category}</button>))}</div></div>
            <div className="form-group"><label className="form-label">Pick Location:</label><LocationPicker setCityCountry={setLocation} /></div>
            <div className="form-group"><label className="form-label">Flight Connections:</label>{flightConnections.map((fc, index) => (<div key={index} className="flight-connection form-group"><h4>{index === 0 ? "Outbound Flight" : "Return Flight"}</h4><label>Departure Airport {index === 0 ? "(Poland)" : `(from ${newOfferData.city})`}:</label><AirportSelect {...(index === 0 ? { country: "PL" } : { city: newOfferData.city, country: newOfferData.country })} value={flightConnections[index].departureAirportIATA} onChange={(iata) => handleFlightChange(index, "departureAirportIATA", iata)} isDeparture={true} /><label>Arrival Airport {index === 0 ? `(to ${newOfferData.city})` : "(Poland)"}:</label><AirportSelect {...(index === 0 ? { city: newOfferData.city, country: newOfferData.country } : { country: "PL" })} value={flightConnections[index].arrivalAirportIATA} onChange={(iata) => handleFlightChange(index, "arrivalAirportIATA", iata)} {...(index === 1 ? { isDeparture: true } : {})} /><label>Departure Time:</label><input type="time" value={flightConnections[index].departureTime || ""} onChange={(e) => handleFlightChange(index, "departureTime", e.target.value)} className="form-input" required /><label>Arrival Time:</label><input type="time" value={flightConnections[index].arrivalTime || ""} onChange={(e) => handleFlightChange(index, "arrivalTime", e.target.value)} className="form-input" required /></div>))}</div>
            <div className="form-group"><label className="form-label">Places to Visit:</label>{placesToVisit.map((place, index) => (<div key={`${place.name}-${index}`} className="form-group place-group"><input type="text" value={place.name || ""} onChange={(e) => handlePlaceChange(index, "name", e.target.value)} placeholder="Place Name" required className="form-input" /><textarea value={place.description || ""} onChange={(e) => handlePlaceChange(index, "description", e.target.value)} placeholder="Place Description" className="form-input" /><input type="file" accept="image/*" onChange={(e) => handlePlaceImageChange(index, e.target.files[0])} className="form-input" />{placesToVisit.length > 1 && (<button type="button" className="btn btn-secondary" onClick={() => removePlace(index)} aria-label={`Remove place ${index + 1}`}>Remove Place</button>)}</div>))}<button type="button" className="btn btn-icon-only" onClick={addPlace} aria-label="Add new place to visit"><img src={plusIcon} alt="" aria-hidden="true" style={{ width: "35px", height: "35px" }} /></button></div>


            <div className="form-group">
              <label className="form-label">Duration (days):</label>
              <input
                className="form-input"
                type="number"
                name="duration"
                value={newOfferData.duration || ""}
                readOnly
                placeholder="Set by adding the first date period"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Add Available Periods:</label>
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
                  aria-label="Add date period"
                >
                  <img
                    src={plusIcon}
                    alt=""
                    aria-hidden="true"
                    style={{ width: "35px", height: "35px" }}
                  />
                </button>
              </div>
            </div>

            {newOfferData.availableDates && newOfferData.availableDates.length > 0 && (
              <div className="form-group" style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                <label style={{ fontWeight: 'bold' }}>
                  Trip Duration: <strong>{newOfferData.duration || 'Not set'} days</strong>
                </label>
                <p style={{ margin: '5px 0 0 0' }}>Added start dates:</p>
                <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
                  {newOfferData.availableDates.map(dateStr => {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const startDate = new Date(Date.UTC(year, month - 1, day));
                    
                    const endDate = new Date(startDate);
                    endDate.setUTCDate(startDate.getUTCDate() + (newOfferData.duration || 1) - 1);
                    
                    return (
                      <li key={dateStr}>
                        {startDate.toLocaleDateString("uk-UA")} - {endDate.toLocaleDateString("uk-UA")}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Price (PLN):</label>
              <input
                className="form-input"
                type="number"
                name="price"
                value={newOfferData.price || ""}
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
                        aria-label={`Remove image ${index + 1}`}
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
    departureAirportIATA: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    availableDates: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    ),
    images: PropTypes.arrayOf(PropTypes.instanceOf(File)),
    mainImageIndex: PropTypes.number,
    placesToVisit: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.instanceOf(File),
      })
    ),
    flightConnections: PropTypes.arrayOf(
      PropTypes.shape({
        departureAirportIATA: PropTypes.string,
        arrivalAirportIATA: PropTypes.string,
        departureTime: PropTypes.string,
        arrivalTime: PropTypes.string,
        flightType: PropTypes.string,
      })
    ),
  }).isRequired,
  setNewOfferData: PropTypes.func.isRequired,
  handleNewOfferChange: PropTypes.func.isRequired,
  handleAddOfferSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default AddOfferModal;