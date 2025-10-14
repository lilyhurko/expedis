import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [tokenExists, setTokenExists] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setTokenExists(!!token);
  }, []);

  if (tokenExists === null) {
    return <div>Loading...</div>; 
  }

  return tokenExists ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
