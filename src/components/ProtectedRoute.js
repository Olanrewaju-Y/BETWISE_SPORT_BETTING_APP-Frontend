import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming you have AuthContext
import Spinner from './Spinner'; // Import the Spinner component

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};
export default ProtectedRoute;