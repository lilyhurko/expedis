import React from 'react';
import { Navigate } from 'react-router-dom';

const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = getUser();
  const userRole = user?.role;
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const isAuthorized = allowedRoles.includes(userRole);

    if (!isAuthorized) {
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (userRole === 'agency') {
        return <Navigate to="/agency/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;