import React, { useState, useEffect } from "react";
import "../assets/styles/Feedback.css";
import { FaTrash, FaEdit } from "react-icons/fa";
import Footer2 from "./Footer2.jsx";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const FeedbackPage = () => {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/comments`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setError("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserString = localStorage.getItem("user");
    if (token && storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString);
        if (storedUser && typeof storedUser === "object") {
          setUser(storedUser);
        }
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || user.role !== "user") return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const updatedCommentsRes = await fetch(`${API_URL}/api/comments`);
      const updatedComments = await updatedCommentsRes.json();
      setComments(updatedComments);
      setMessage("");
      setError("");
    } catch (error) {
      setError("Failed to submit comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      setComments(comments.filter((comment) => comment._id !== id));
    } catch (err) {
      setError("Failed to delete comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditingMessage(comment.message);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingMessage("");
  };

  const handleUpdate = async () => {
    if (!editingMessage.trim()) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/comments/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: editingMessage }),
      });

      if (!res.ok) throw new Error("Failed to update comment");

      setComments(
        comments.map((comment) =>
          comment._id === editingId
            ? { ...comment, message: editingMessage }
            : comment
        )
      );
      setEditingId(null);
      setEditingMessage("");
    } catch (err) {
      setError("Failed to update comment");
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarUrl = (userData) => {
    if (userData && userData.avatar) {
      if (userData.avatar.startsWith("http")) return userData.avatar;
      return `${API_URL}${userData.avatar}`;
    }
    return "https://via.placeholder.com/50?text=U";
  };

  return (
    <>
      <div className="feedback-page">
        <h2 className="feedback-title">Leave Feedback</h2>

        <div className="feedback-container">
          {error && <div className="alert alert-danger">{error}</div>}

          {user ? (
            user.role === "user" ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="commentTextarea" className="form-label">
                    Your Comment
                  </label>
                  <textarea
                    id="commentTextarea"
                    className="form-control"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary-submit"
                  disabled={isLoading || !message.trim()}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </form>
            ) : (
              <p
                className="text-muted"
                style={{
                  fontStyle: "italic",
                  border: "1px dashed #ccc",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                Writing comments is allowed only for travelers. You are logged
                in as <strong>{user.role}</strong>.
              </p>
            )
          ) : (
            <p className="text-muted">Please log in to leave a comment.</p>
          )}

          <hr />
        </div>
        <div className="coments-box">
          <h4 className="feedback-subtitle">All Comments</h4>
          {isLoading && comments.length === 0 ? (
            <div className="text-center">Loading comments...</div>
          ) : comments.length > 0 ? (
            <div className="comments-container">
              {comments.map((comment) => {
                const commentUser = comment.userId || {};

                const isOwner =
                  user &&
                  (user.id === commentUser._id || user._id === commentUser._id);
                const isAdmin = user && user.role === "admin";

                const canDelete = isOwner || isAdmin;
                const canEdit = isOwner;

                return (
                  <div key={comment._id} className="comment card mb-3">
                    <div className="card-body position-relative">
                      {(canDelete || canEdit) && (
                        <div className="admin-actions">
                          {canEdit && (
                            <button
                              className="edit-icon-button"
                              onClick={() => handleEdit(comment)}
                              disabled={isLoading}
                              title="Edit"
                            >
                              <FaEdit className="edit-icon" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="delete-icon-button"
                              onClick={() => handleDelete(comment._id)}
                              disabled={isLoading}
                              title="Delete"
                            >
                              <FaTrash className="delete-icon" />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="d-flex">
                        <div className="flex-shrink-0 me-3">
                          <img
                            src={getAvatarUrl(commentUser)}
                            alt={commentUser.username || "User"}
                            className="comment-avatar"
                          />
                        </div>

                        <div className="comment-content">
                          <div
                            className={`comment-header ${
                              canDelete || canEdit ? "has-admin-actions" : ""
                            }`}
                          >
                            <h5 className="card-title mb-1">
                              {commentUser.username ||
                                comment.username ||
                                "Anonymous"}
                            </h5>
                          </div>
                          <small className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </small>

                          {editingId === comment._id ? (
                            <div className="mt-2">
                              <textarea
                                className="form-control mb-2"
                                rows="3"
                                value={editingMessage}
                                onChange={(e) =>
                                  setEditingMessage(e.target.value)
                                }
                                disabled={isLoading}
                              />
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={handleUpdate}
                                  disabled={isLoading || !editingMessage.trim()}
                                >
                                  {isLoading ? "Saving..." : "Save"}
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={handleCancelEdit}
                                  disabled={isLoading}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="card-text text-break">
                              {comment.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted">No comments yet.</p>
          )}
        </div>
      </div>
      <Footer2 />
    </>
  );
};

export default FeedbackPage;
