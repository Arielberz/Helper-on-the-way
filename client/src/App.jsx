import { Routes, Route } from "react-router-dom";
import "./App.css";
import Landing from "./pages/landing/landing";
import Register from "./pages/register/register";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Payment from "./pages/payment/payment";
import Chat from "./pages/chat/chat";
import Rating from "./pages/rating/rating";
import Profile from "./pages/profile/profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Rating"
          element={
            <ProtectedRoute>
              <Rating />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
         <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Landing />} />
       
      </Routes>
    </>
  );
}

// Placeholder components

function About() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold">About</h1>
    </div>
  );
}

function Services() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold">Services</h1>
    </div>
  );
}

function Contact() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold">Contact</h1>
    </div>
  );
}

export default App;
