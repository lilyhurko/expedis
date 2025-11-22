import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaHeart } from "react-icons/fa";
import styles from "../assets/styles/OfferCard.module.css";

const OfferCard = ({
  offer,
  userRole,
  currentUserId,
  handleBookNow,
  handleEditOffer,
  handleDeleteOffer,
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  const creatorId =
    typeof offer.creator === "object" ? offer.creator?._id : offer.creator;

  const isOwner =
    userRole === "agency" &&
    creatorId &&
    currentUserId &&
    creatorId.toString() === currentUserId.toString();
  const isAdmin = userRole === "admin";

  const canEditOnlyByOwner = isOwner;
  const canDelete = isAdmin || isOwner;

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${apiUrl}/api/users/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const wishlist = await response.json();
          const exists = wishlist.some((item) => item._id === offer._id);
          setIsLiked(exists);
        }
      } catch (error) {
        console.error("Wishlist check error", error);
      }
    };
    checkWishlistStatus();
  }, [offer._id, apiUrl]);

  const handleCardClick = () => {
    navigate(`/offer/${offer._id}`);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add to wishlist");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/users/wishlist/${offer._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isAdded);
      }
    } catch (error) {
      console.error("Wishlist toggle error", error);
    }
  };

  const buildImageUrl = (filename) => {
    if (!filename || filename === "") return null;
    if (filename.startsWith("http")) return filename;
    return `${apiUrl}${filename.startsWith("/") ? "" : "/"}${filename}`;
  };

  return (
    <div
      className={styles.offerCard}
      onClick={handleCardClick} 
      style={{ cursor: "pointer", position: "relative" }}
    >
      {!canDelete && (
        <button
          onClick={handleToggleWishlist}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.8)",
            border: "none",
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isLiked ? "#ff4757" : "#ccc",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease",
          }}
          title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FaHeart size={18} />
        </button>
      )}

      {canDelete && (
        <div className={styles.adminActions}>
          {canEditOnlyByOwner && (
            <button
              className={styles.editIconButton}
              onClick={(e) =>
                handleActionClick(e, () => handleEditOffer(offer._id))
              }
              aria-label="Edit offer"
            >
              <FaEdit className={styles.editIcon} />
            </button>
          )}

          <button
            className={styles.deleteIconButton}
            onClick={(e) =>
              handleActionClick(e, () => handleDeleteOffer(offer._id))
            }
            aria-label="Delete offer"
          >
            <FaTrash className={styles.deleteIcon} />
          </button>
        </div>
      )}

      <div className={styles.imageWrapper}>
        {offer.imageUrls &&
        offer.imageUrls.length > 0 &&
        buildImageUrl(offer.imageUrls[0]) ? (
          <img
            src={buildImageUrl(offer.imageUrls[0])}
            alt={offer.title || "Offer"}
            className={styles.offerImage}
            onError={(e) => {
              console.warn("Image load failed:", e.target.src);
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
            }}
          />
        ) : (
          <div className={styles.noImagePlaceholder}>No Image</div>
        )}
      </div>

      <div className={styles.offerContent}>
        <p className={styles.offerLocation}>
          <span className={styles.locationIcon}></span>
          {offer.city}, {offer.country || "United State of America"}
        </p>

        <h3 className={styles.offerTitle}>{offer.title}</h3>

        <div className={styles.offerFooter}>
          <span className={styles.offerPrice}>{offer.price || 0} PLN</span>
          
          <div className={styles.offerActions}>
            {!canDelete && (
              <button
                className="book-now-button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleBookNow(offer._id); 
                }}
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
