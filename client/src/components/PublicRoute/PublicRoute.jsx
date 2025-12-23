import { Navigate } from "react-router-dom";
import { getToken } from "../../utils/authUtils";

const PublicRoute = ({ children }) => {
  const token = getToken();
  
  // If token exists, redirect to home page
  if (token) {
    return <Navigate to="/home" replace />;
  }
  
  // If no token exists, render the public page
  return children;
};

export default PublicRoute;
