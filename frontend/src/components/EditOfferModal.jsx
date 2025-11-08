import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-multi-date-picker";
import plusIcon from "../assets/img/plus.png";
import LocationPicker from "./LocationPicker.js";
import AirportSelect from "./AirportSelect.js";
import { flushSync } from "react-dom";

const EditOfferModal = ({
  offer,
  editFormData,
  setEditFormData,
  handleEditFormChange,
  handleEditSubmit,
  closeModal,
}) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [location, setLocation] = useState({
    city: "",
    country: "",
  });
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

  const prevCityRef = useRef();
  const prevCountryRef = useRef();
  const isInitializedRef = useRef(false);
  const lastFlightConnectionsRef = useRef([]);

  const ALL_CATEGORIES = [
    "Adventure", "Culture", "Relaxation", "Nature", "Hiking", "Skiing", "Beach",
    "History", "Nightlife", "Food", "Wildlife", "Romantic", "Luxury", "Budget",
    "Camping", "Backpacking", "Photography", "Yoga", "Surfing", "Diving", "Art",
    "Architecture", "Shopping", "Festival", "Wellness",
  ];

  // СТАЛО:
  useLayoutEffect(() => {
    if (!offer || isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    console.log("Initializing edit modal with offer:", offer);

    let cleanedCategories = [];
    if (offer.categories) {
      cleanedCategories = Array.isArray(offer.categories)
        ? offer.categories
            .map((cat) => cat.replace(/^"|"$/g, "").replace(/\\"/g, "").trim())
            .filter((cat) => cat && ALL_CATEGORIES.includes(cat))
        : [];
    }

    const initCity = offer.city || "";
    const initCountry = offer.country || "";
    setLocation({ city: initCity, country: initCountry });

    prevCityRef.current = initCity;
    prevCountryRef.current = initCountry;

    const initPlaces = (offer.placesToVisit || []).map((place) => ({
      ...place,
      image: null,
    }));
    if (initPlaces.length === 0) {
      initPlaces.push({ name: "", description: "", image: null });
    }
    setPlacesToVisit(initPlaces);

    const offerConnectionsRaw = offer.flightConnections;
    let parsedConnections = [];
    if (typeof offerConnectionsRaw === "string") {
      try {
        parsedConnections = JSON.parse(offerConnectionsRaw);
      } catch (e) {
        parsedConnections = [];
      }
    } else if (Array.isArray(offerConnectionsRaw)) {
      parsedConnections = offerConnectionsRaw;
    }
    const initConnections = [
      {
        departureAirportIATA: parsedConnections[0]?.departureAirportIATA || "",
        arrivalAirportIATA: parsedConnections[0]?.arrivalAirportIATA || "",
        departureTime: parsedConnections[0]?.departureTime || "",
        arrivalTime: parsedConnections[0]?.arrivalTime || "",
        flightType: "outbound",
      },
      {
        departureAirportIATA: parsedConnections[1]?.departureAirportIATA || "",
        arrivalAirportIATA: parsedConnections[1]?.arrivalAirportIATA || "",
        departureTime: parsedConnections[1]?.departureTime || "",
        arrivalTime: parsedConnections[1]?.arrivalTime || "",
        flightType: "return",
      },
    ];
    setFlightConnections(initConnections);

    const initPreviews = (offer.imageUrls || [])
      .filter((url) => url && typeof url === "string")
      .map((url) => ({ preview: url }));
    setPreviewImages(initPreviews);

    const initMainIndex = offer.mainImageIndex ?? 0;
    const finalMainIndex =
      initMainIndex >= 0 && initMainIndex < initPreviews.length
        ? initMainIndex
        : 0;
    setMainImageIndex(finalMainIndex);

    const initDates = (offer.availableDates || [])
      .map((date) => {
        if (typeof date === "string") {
          return date.split('T')[0];
        }
        if (date instanceof Date && !isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
        return null;
      })
      .filter(Boolean)
      .sort();

    flushSync(() => {
      setEditFormData({
        _id: offer._id,
        title: offer.title || "",
        description: offer.description || "",
        price: offer.price || "",
        duration: offer.duration || "",
        city: initCity,
        country: initCountry,
        departureAirportIATA: initConnections[0]?.departureAirportIATA || "",
        categories: cleanedCategories.length > 0 ? cleanedCategories : [],
        availableDates: initDates,
        images: [],
        imageUrls: initPreviews.map((img) => img.preview),
        mainImageIndex: finalMainIndex,
        placesToVisit: initPlaces,
        flightConnections: initConnections,
      });
    });
  }, [offer, setEditFormData, ALL_CATEGORIES]); 

  useEffect(() => {
    if (isInitializedRef.current && editFormData.flightConnections) {
      const stringifiedNew = JSON.stringify(editFormData.flightConnections);
      const stringifiedLast = JSON.stringify(lastFlightConnectionsRef.current);
      if (stringifiedNew !== stringifiedLast) {
        setFlightConnections(editFormData.flightConnections);
        lastFlightConnectionsRef.current = editFormData.flightConnections;
      }
    }
  }, [editFormData.flightConnections]);

  useEffect(() => {
    if (isInitializedRef.current) {
      setEditFormData((prev) => ({
        ...prev,
        city: location.city,
        country: location.country,
      }));
    }
  }, [location.city, location.country, setEditFormData]);

  useEffect(() => {
    const currentCity = location.city;
    const currentCountry = location.country;

    if (
      prevCityRef.current !== undefined &&
      (currentCity !== prevCityRef.current ||
        currentCountry !== prevCountryRef.current)
    ) {
      const defaultConnections = [
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
      ];
      setEditFormData((prev) => ({
        ...prev,
        departureAirportIATA: "",
        flightConnections: defaultConnections,
      }));
      setFlightConnections(defaultConnections);
    }

    prevCityRef.current = currentCity;
    prevCountryRef.current = currentCountry;
  }, [location.city, location.country, setEditFormData]);

  const handleCategoryToggle = (category) => {
    setEditFormData((prev) => {
      const selected = Array.isArray(prev.categories) ? prev.categories : [];
      if (selected.includes(category)) {
        return { ...prev, categories: selected.filter((c) => c !== category) };
      } else if (selected.length < 5) {
        return { ...prev, categories: [...selected, category] };
      } else {
        setError("You can select up to 5 categories.");
        return prev;
      }
    });
  };

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

    const existingDates = (editFormData.availableDates || []).map((date) => {
      if (typeof date === "string") return date.split("T")[0];
      if (date instanceof Date) return date.toISOString().split("T")[0];
      if (date?.toDate) return date.toDate().toISOString().split("T")[0];
      return null;
    }).filter((date) => date !== null);

    const currentDuration = editFormData.duration || 0;

    if (currentDuration === 0) {
      setEditFormData((prev) => ({
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

      setEditFormData((prev) => ({
        ...prev,
        availableDates: sortedDates,
      }));
      setError(null);
    }

    setPeriodStart(null);
    setPeriodEnd(null);
  };

  const handleFlightChange = (index, field, value) => {
    setFlightConnections((prevConnections) => {
      const updatedConnections = [...prevConnections];
      updatedConnections[index] = {
        ...updatedConnections[index],
        [field]: value,
      };

      setEditFormData((prev) => {
        const newConnections = [...updatedConnections];
        return {
          ...prev,
          flightConnections: newConnections,
          ...(field === "departureAirportIATA" && index === 0
            ? { departureAirportIATA: value }
            : {}),
        };
      });

      return updatedConnections;
    });
  };

  const handlePlaceChange = (index, field, value) => {
    const newPlaces = [...placesToVisit];
    newPlaces[index][field] = value;
    setPlacesToVisit(newPlaces);
    setEditFormData((prev) => ({ ...prev, placesToVisit: newPlaces }));
  };

  const addPlace = () => {
    setPlacesToVisit([
      ...placesToVisit,
      { name: "", description: "", image: null },
    ]);
  };

  const removePlace = (index) => {
    if (placesToVisit.length === 1) {
      setError("At least one place to visit is required.");
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
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setPreviewImages((prevImages) => {
      if (prevImages.length + files.length > 15) {
        setError("You can upload a maximum of 15 images.");
        return prevImages;
      }

      const newImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      const updatedImages = [...prevImages, ...newImages];

      setEditFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...files],
      }));

      setMainImageIndex((prevMainIndex) => {
        if (prevMainIndex === null && newImages.length > 0) {
          return prevImages.length;
        }
        return prevMainIndex;
      });

      return updatedImages;
    });
  };

  const setMainImage = (index) => {
    setMainImageIndex(index);
    setEditFormData((prev) => ({
      ...prev,
      mainImageIndex: index,
    }));
  };

  const removeImage = (index) => {
    if (previewImages[index]?.file) {
      URL.revokeObjectURL(previewImages[index].preview);
    }
    const removedPreview = previewImages[index]?.preview;
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    
    setEditFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((file) => file.preview !== removedPreview),
      imageUrls: (prev.imageUrls || []).filter((url) => url !== removedPreview),
    }));

    if (mainImageIndex === index) {
      setMainImageIndex(null);
    } else if (mainImageIndex !== null && index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const validateForm = () => {
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();

    if (editFormData._id) {
      formData.append("_id", editFormData._id);
    }

    formData.append("title", editFormData.title || "");
    formData.append("description", editFormData.description || "");
    formData.append("price", editFormData.price || "");
    formData.append("duration", editFormData.duration || "");
    formData.append("city", editFormData.city || "");
    formData.append("country", editFormData.country || "");
    formData.append(
      "departureAirportIATA",
      editFormData.departureAirportIATA || ""
    );
    formData.append(
      "categories",
      JSON.stringify(editFormData.categories || [])
    );
    
    const validDates = (editFormData.availableDates || []).map((date) => {
        if (date instanceof Date) return date.toISOString().split("T")[0];
        return date.split('T')[0];
    }).filter(Boolean);

    formData.append("availableDates", JSON.stringify(validDates));
    
    formData.append(
      "placesToVisit",
      JSON.stringify(
        placesToVisit.map(({ name, description }) => ({
          name: name || "",
          description: description || "",
        }))
      )
    );
    
    const safeFlightConnections = editFormData.flightConnections || [
      { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "outbound" },
      { departureAirportIATA: "", arrivalAirportIATA: "", departureTime: "", arrivalTime: "", flightType: "return" },
    ];
    formData.append(
      "flightConnections",
      JSON.stringify(safeFlightConnections)
    );
    formData.append("mainImageIndex", mainImageIndex || 0);

    (editFormData.images || []).forEach((image) => {
      formData.append("images", image);
    });

    const existingImageUrls = previewImages
      .filter(img => !img.file && img.preview)
      .map(img => img.preview);
    formData.append("imageUrls", JSON.stringify(existingImageUrls));

    placesToVisit.forEach((place) => {
      if (place.image) {
        formData.append("placeImages", place.image);
      }
    });

    try {
      await handleEditSubmit(formData);
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to update offer. Please try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-add">
        <div className="modal-header">
          <h3 className="modal-title">
            Edit Offer: {offer?.title || "Selected Offer"}
          </h3>
          <button className="modal-close" onClick={closeModal}>
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
            <div className="form-group">
              <label className="form-label">Title:</label>
              <input
                className="form-input"
                type="text"
                name="title"
                value={editFormData.title || ""}
                onChange={handleEditFormChange}
                placeholder="Enter title"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea
                className="form-input form-textarea"
                name="description"
                value={editFormData.description || ""}
                onChange={handleEditFormChange}
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
                      editFormData.categories?.includes(category)
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
              <LocationPicker
                setCityCountry={setLocation}
                initialCity={location.city}
                initialCountry={location.country}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Flight Connections:</label>
              {flightConnections.map((fc, index) => (
                <div
                  key={`flight-${index}`}
                  className="flight-connection form-group"
                >
                  <h4>{index === 0 ? "Outbound Flight" : "Return Flight"}</h4>
                  <label>
                    Departure Airport{" "}
                    {index === 0 ? "(Poland)" : `(from ${editFormData.city})`}:
                  </label>
                  <AirportSelect
                    key={`dep-${index}-${location.city || "none"}-${
                      location.country || "none"
                    }-${fc.departureAirportIATA || "empty"}`}
                    {...(index === 0
                      ? { country: "PL" }
                      : {
                          city: editFormData.city,
                          country: editFormData.country,
                        })}
                    value={fc.departureAirportIATA || ""}
                    onChange={(iata) =>
                      handleFlightChange(index, "departureAirportIATA", iata)
                    }
                    isDeparture={true}
                  />
                  <label>
                    Arrival Airport{" "}
                    {index === 0 ? `(to ${editFormData.city})` : "(Poland)"}:
                  </label>
                  <AirportSelect
                    key={`arr-${index}-${location.city || "none"}-${
                      location.country || "none"
                    }-${fc.arrivalAirportIATA || "empty"}`}
                    {...(index === 0
                      ? {
                          city: editFormData.city,
                          country: editFormData.country,
                        }
                      : { country: "PL" })}
                    value={fc.arrivalAirportIATA || ""}
                    onChange={(iata) =>
                      handleFlightChange(index, "arrivalAirportIATA", iata)
                    }
                    {...(index === 1 ? { isDeparture: true } : {})}
                  />
                  <label>Departure Time:</label>
                  <input
                    type="time"
                    value={fc.departureTime || ""}
                    onChange={(e) =>
                      handleFlightChange(index, "departureTime", e.target.value)
                    }
                    className="form-input"
                  />
                  <label>Arrival Time:</label>
                  <input
                    type="time"
                    value={fc.arrivalTime || ""}
                    onChange={(e) =>
                      handleFlightChange(index, "arrivalTime", e.target.value)
                    }
                    className="form-input"
                  />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Places to Visit:</label>
              {placesToVisit.map((place, index) => (
                <div key={index} className="form-group place-group">
                  <input
                    type="text"
                    value={place.name || ""}
                    onChange={(e) =>
                      handlePlaceChange(index, "name", e.target.value)
                    }
                    placeholder="Place Name"
                    className="form-input"
                  />
                  <textarea
                    value={place.description || ""}
                    onChange={(e) =>
                      handlePlaceChange(index, "description", e.target.value)
                    }
                    placeholder="Place Description"
                    className="form-input form-textarea"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handlePlaceImageChange(index, e.target.files[0])
                    }
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
                <img
                  src={plusIcon}
                  alt="Add"
                  style={{ width: "35px", height: "35px" }}
                />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (days):</label>
              <input
                className="form-input"
                type="number"
                name="duration"
                value={editFormData.duration || ""}
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

            {editFormData.availableDates &&
              editFormData.availableDates.length > 0 && (
                <div
                  className="form-group"
                  style={{
                    padding: "10px",
                    background: "#f9f9f9",
                    borderRadius: "6px",
                  }}
                >
                  <label style={{ fontWeight: "bold" }}>
                    Trip Duration:{" "}
                    <strong>{editFormData.duration || "Not set"} days</strong>
                  </label>
                  <p style={{ margin: "5px 0 0 0" }}>Added start dates:</p>
                  <ul style={{ paddingLeft: "20px", margin: "5px 0 0 0" }}>
                    {editFormData.availableDates.map((dateStr) => {
                      const [year, month, day] = dateStr.split("-").map(Number);
                      const startDate = new Date(Date.UTC(year, month - 1, day));
                      const endDate = new Date(startDate);
                      endDate.setUTCDate(
                        startDate.getUTCDate() + (editFormData.duration || 1) - 1
                      );
                      return (
                        <li key={dateStr}>
                          {startDate.toLocaleDateString("uk-UA")} -{" "}
                          {endDate.toLocaleDateString("uk-UA")}
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
                value={editFormData.price || ""}
                onChange={handleEditFormChange}
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
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
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
    departureAirportIATA: PropTypes.string,
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
  editFormData: PropTypes.shape({
    _id: PropTypes.string,
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
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    mainImageIndex: PropTypes.number,
    placesToVisit: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.any,
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
  setEditFormData: PropTypes.func.isRequired,
  handleEditFormChange: PropTypes.func.isRequired,
  handleEditSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default EditOfferModal;