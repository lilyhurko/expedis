import React, { useState, useEffect } from 'react';
import '../assets/styles/Feedback.css';
import ForcedLogout from './ForcedLogout';
import { FaTrash, FaEdit } from 'react-icons/fa';

const FeedbackPage = () => {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5001/api/comments');
        if (!res.ok) throw new Error('Failed to fetch comments');
        const data = await res.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserString = localStorage.getItem('user');

    if (token && storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString);
        if (storedUser && typeof storedUser === 'object') {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user || user.role === 'admin') return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error('Failed to add comment');

      const newComment = await res.json();
      newComment.createdAt = new Date().toISOString();
      setComments([newComment, ...comments]);

      setMessage('');
      setError('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
      ForcedLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/comments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete comment');

      setComments(comments.filter(comment => comment._id !== id));
      setError('');
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
      ForcedLogout();
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
    setEditingMessage('');
  };

  const handleUpdate = async () => {
    if (!editingMessage.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/comments/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: editingMessage }),
      });

      if (!res.ok) throw new Error('Failed to update comment');

      setComments(comments.map(comment =>
        comment._id === editingId
          ? { ...comment, message: editingMessage }
          : comment
      ));
      setEditingId(null);
      setEditingMessage('');
      setError('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
      ForcedLogout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <h2>Leave Feedback</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {user ? (
          user.role !== 'admin' ? (
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
                className="btn btn-primary"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          ) : (
            <p className="text-muted">Admins cannot submit comments.</p>
          )
        ) : (
          <p className="text-muted">Please log in to leave a comment.</p>
        )}

        <hr />

        <h4>All Comments</h4>
        {isLoading && comments.length === 0 ? (
          <div className="text-center">Loading comments...</div>
        ) : comments.length > 0 ? (
          <div className="comments-container">
            {comments.map((comment) => (
              <div key={comment._id} className="comment card mb-3">
                <div className="card-body position-relative">
                  
                  {/* Admin actions positioned in top-right corner */}
                  {user && (user.role === 'admin' || user.id === comment.userId || user._id === comment.userId) && (
                    <div className="admin-actions">
                      {(user.id === comment.userId || user._id === comment.userId) && (
                        <button
                          className="edit-icon-button"
                          onClick={() => handleEdit(comment)}
                          disabled={isLoading}
                          title="Edit"
                        >
                          <FaEdit className="edit-icon" />
                        </button>
                      )}
                      <button
                        className="delete-icon-button"
                        onClick={() => handleDelete(comment._id)}
                        disabled={isLoading}
                        title="Delete"
                      >
                        <FaTrash className="delete-icon" />
                      </button>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">{comment.username}</h5>
                    <small className="comment-date text-muted">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  {editingId === comment._id ? (
                    <>
                      <textarea
                        className="form-control mt-2 mb-2"
                        rows="3"
                        value={editingMessage}
                        onChange={(e) => setEditingMessage(e.target.value)}
                        disabled={isLoading}
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={handleUpdate}
                          disabled={isLoading || !editingMessage.trim()}
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="card-text">{comment.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;