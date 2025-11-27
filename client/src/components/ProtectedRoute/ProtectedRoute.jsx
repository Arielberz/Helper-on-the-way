import { Navigate } from "react-router-dom";
import { getToken } from "../../utils/authUtils";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  
  // If no token exists or session expired, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If token exists, render the protected page
  return children;
};

export default ProtectedRoute;
