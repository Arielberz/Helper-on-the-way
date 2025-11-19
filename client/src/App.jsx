import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/login/Login";
import Register from "./pages/register/register";
import Landing from "./pages/landing/Landing";
import Home from "./pages/home/home.jsx";
import Payment from "./pages/payment/Payment.jsx";
import Chat from "./pages/chat/Chat.jsx";
import Rating from "./pages/rating/Rating.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Header_in from "./components/Header_in/Header.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/Rating" element={<ProtectedRoute><Rating /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Landing />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
