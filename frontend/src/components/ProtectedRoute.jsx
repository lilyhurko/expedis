import React from 'react';
import { Navigate } from 'react-router-dom';

const getRole = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.role;
  } catch (e) {
    return null;
  }
};


const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = getRole();
  const isAuthenticated = !!token; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const isAuthorized = allowedRoles.includes(userRole) || userRole === 'admin'; 

    if (!isAuthorized) {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;