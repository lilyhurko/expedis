import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt } from "react-icons/fa";
import styles from "../assets/styles/Wishlist.module.css"; 

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (e, offerId) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${apiUrl}/api/users/wishlist/${offerId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setWishlist((prev) => prev.filter((item) => item._id !== offerId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const buildImageUrl = (filename) => {
    if (!filename) return "https://via.placeholder.com/300x200?text=No+Image";
    if (filename.startsWith("http")) return filename;
    return `${apiUrl}${filename}`;
  };

  if (isLoading) return <div>Loading wishlist...</div>;

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>My Wishlist </h3>

      {wishlist.length === 0 ? (
        <div className={styles.emptyState}>
          <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Your wishlist is empty.</p>
          <p>
            Find your dream trip on the <Link to="/" className={styles.exploreLink}>home page</Link>!
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlist.map((offer) => (
            <Link 
              to={`/offer/${offer._id}`} 
              key={offer._id} 
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={
                    offer.imageUrls && offer.imageUrls.length > 0
                      ? buildImageUrl(offer.imageUrls[0])
                      : buildImageUrl(offer.imageUrl)
                  }
                  alt={offer.title}
                />
                <button
                  className={styles.removeBtn}
                  onClick={(e) => handleRemove(e, offer._id)}
                  title="Remove from wishlist"
                >
                  <FaHeart />
                </button>
              </div>
              <div className={styles.content}>
                <h4 className={styles.title}>{offer.title}</h4>
                <div className={styles.location}>
                  <FaMapMarkerAlt size={12} />
                  {offer.city}, {offer.country}
                </div>
                <div className={styles.price}>{offer.price} PLN</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;