import React, { useState, useEffect } from "react";
import { FaUser, FaChild, FaCalendarAlt } from "react-icons/fa";
import styles from "../assets/styles/Modals.module.css";

const BookingModal = ({
  offer,
  userData,
  handleBookingSubmit,
  closeModal,
  initialDate,      
  initialTravelers  
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [bookForSelf, setBookForSelf] = useState(true);

  const [adults, setAdults] = useState(() => {
    const count = initialTravelers?.adults || 1;
    const initialArray = Array(count).fill(null).map(() => ({ name: "", surname: "" }));
    
    if (userData && initialArray.length > 0) {
        initialArray[0] = { 
            name: userData.name || "", 
            surname: userData.surname || "" 
        };
    }
    return initialArray;
  });

  const [children, setChildren] = useState(() => {
    const inputChildren = initialTravelers?.children || [];
    if (inputChildren.length > 0) {
        return inputChildren.map(child => ({
            name: "",
            surname: "",
            birthDate: child.birthDate || "" 
        }));
    }
    return [];
  });

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    setAdults(prevAdults => {
        const newAdults = [...prevAdults];
        if (newAdults.length === 0) return newAdults;

        if (bookForSelf) {
            newAdults[0] = {
                ...newAdults[0], 
                name: userData?.name || "",
                surname: userData?.surname || ""
            };
        } else {
            if (newAdults[0].name === userData?.name) {
                newAdults[0] = { ...newAdults[0], name: "", surname: "" };
            }
        }
        return newAdults;
    });
  }, [bookForSelf, userData]);

  useEffect(() => {
    if (!offer?.price) return;

    let total = adults.length * offer.price;

    children.forEach((child) => {
      if (!child.birthDate || !selectedDate) return;

      const tripDate = new Date(selectedDate);
      const birthDate = new Date(child.birthDate);

      let age = tripDate.getFullYear() - birthDate.getFullYear();
      const m = tripDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && tripDate.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 2) total += offer.price * 0.1; // Infant
      else if (age < 12) total += offer.price * 0.7; // Child
      else total += offer.price; // Teen treated as adult price
    });

    setTotalPrice(total);
  }, [adults.length, children, selectedDate, offer]);

  const handleAdultCount = (delta) => {
    setAdults((prev) => {
      if (delta > 0) return [...prev, { name: "", surname: "" }];
      if (delta < 0 && prev.length > 1) return prev.slice(0, -1);
      return prev;
    });
  };

  const handleChildCount = (delta) => {
    setChildren((prev) => {
      if (delta > 0) return [...prev, { name: "", surname: "", birthDate: "" }];
      if (delta < 0 && prev.length > 0) return prev.slice(0, -1);
      return prev;
    });
  };

  const updateTraveler = (type, index, field, value) => {
    if (type === "adult") {
      const newAdults = [...adults];
      newAdults[index][field] = value;
      setAdults(newAdults);
    } else {
      const newChildren = [...children];
      newChildren[index][field] = value;
      setChildren(newChildren);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) return alert("Please select a date");

    const allAdultsValid = adults.every((a) => a.name && a.surname);
    const allChildrenValid = children.every(
      (c) => c.name && c.surname && c.birthDate
    );

    if (!allAdultsValid || !allChildrenValid)
      return alert("Please fill in all traveler details");

    handleBookingSubmit({
      offerId: offer._id,
      amount: parseFloat(totalPrice.toFixed(2)),
      selectedDate,
      travelers: {
        adults: adults.length,
        children: children,
        details: [...adults, ...children], 
      },
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>Confirm Your Trip</h3>
            <p className={styles.modalSubtitle}>{offer?.title}</p>
          </div>
          <button className={styles.modalClose} onClick={closeModal}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <form id="booking-form" onSubmit={handleSubmit}>
            <div className={styles.section}>
              <label className={styles.label}>
                <FaCalendarAlt /> Select Date
              </label>
              <select
                className={styles.selectInput}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              >
                <option value="" disabled>
                  -- Choose start date --
                </option>
                {offer?.availableDates
                  ?.filter((d) => new Date(d) >= today)
                  .map((date, i) => (
                    <option key={i} value={date}>
                      {new Date(date).toLocaleDateString()} ({offer.duration}{" "}
                      days)
                    </option>
                  ))}
              </select>
            </div>

            <div className={styles.section}>
              <div className={styles.counterRow}>
                <div className={styles.counterLabel}>
                  <span className={styles.typeTitle}>Adults</span>
                  <span className={styles.typeDesc}>Age 12+</span>
                </div>
                <div className={styles.counterControls}>
                  <button
                    type="button"
                    onClick={() => handleAdultCount(-1)}
                    disabled={adults.length <= 1}
                  >
                    -
                  </button>
                  <span>{adults.length}</span>
                  <button type="button" onClick={() => handleAdultCount(1)}>
                    +
                  </button>
                </div>
              </div>
              <div className={styles.counterRow}>
                <div className={styles.counterLabel}>
                  <span className={styles.typeTitle}>Children</span>
                  <span className={styles.typeDesc}>Age 0-11</span>
                </div>
                <div className={styles.counterControls}>
                  <button
                    type="button"
                    onClick={() => handleChildCount(-1)}
                    disabled={children.length === 0}
                  >
                    -
                  </button>
                  <span>{children.length}</span>
                  <button type="button" onClick={() => handleChildCount(1)}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.travelersDetailsList}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  id="selfBook"
                  checked={bookForSelf}
                  onChange={(e) => setBookForSelf(e.target.checked)}
                />
                <label htmlFor="selfBook">I am one of the travelers</label>
              </div>

              {adults.map((adult, i) => (
                <div key={`adult-${i}`} className={styles.travelerCard}>
                  <div className={styles.cardHeader}>
                    <FaUser /> Adult {i + 1}
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      placeholder="First Name"
                      value={adult.name}
                      onChange={(e) =>
                        updateTraveler("adult", i, "name", e.target.value)
                      }
                      readOnly={bookForSelf && i === 0}
                      className={bookForSelf && i === 0 ? styles.readOnly : ""}
                      required
                    />
                    <input
                      placeholder="Last Name"
                      value={adult.surname}
                      onChange={(e) =>
                        updateTraveler("adult", i, "surname", e.target.value)
                      }
                      readOnly={bookForSelf && i === 0}
                      className={bookForSelf && i === 0 ? styles.readOnly : ""}
                      required
                    />
                  </div>
                </div>
              ))}

              {children.map((child, i) => (
                <div key={`child-${i}`} className={styles.travelerCard}>
                  <div className={styles.cardHeader}>
                    <FaChild /> Child {i + 1}
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      placeholder="First Name"
                      value={child.name}
                      onChange={(e) =>
                        updateTraveler("child", i, "name", e.target.value)
                      }
                      required
                    />
                    <input
                      placeholder="Last Name"
                      value={child.surname}
                      onChange={(e) =>
                        updateTraveler("child", i, "surname", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className={styles.dateInputWrapper}>
                    <label>Date of Birth:</label>
                    <input
                      type="date"
                      value={child.birthDate}
                      onChange={(e) =>
                        updateTraveler("child", i, "birthDate", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.priceBreakdown}>
            <span className={styles.totalLabel}>Total Price</span>
            <span className={styles.totalAmount}>
              {totalPrice.toFixed(2)} PLN
            </span>
            {children.length > 0 && (
              <small className={styles.discountNote}>
                *Includes child discounts
              </small>
            )}
          </div>
          <div className={styles.buttonsGroup}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="booking-form"
              className={styles.btnPrimary}
            >
              Confirm & Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;