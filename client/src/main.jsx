import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.jsx";
import { BrowserRouter } from "react-router-dom";
import { AlertProvider } from "./context/AlertContext";
import { isTokenExpired, clearAuthData } from "./utils/authUtils";

// Clear expired tokens on app startup
const token = localStorage.getItem('token');
if (token && isTokenExpired(token)) {
  console.log('Clearing expired token on startup');
  clearAuthData();
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AlertProvider>
      <App />
    </AlertProvider>
  </BrowserRouter>
);
