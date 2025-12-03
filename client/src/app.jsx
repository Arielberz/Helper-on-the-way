import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/landing";
import Register from "./pages/register/register";
import Login from "./pages/login/login";
import Home from "./pages/home/home";
import Chat from "./pages/chat/chat";
import Rating from "./pages/Rating/Rating";
import Profile from "./pages/Profile/profile";
import PendingHelpers from "./pages/PendingHelpers/PendingHelpers";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { RatingProvider } from "./context/RatingContext";
import GlobalRatingModal from "./components/GlobalRatingModal/GlobalRatingModal";
import { HelperRequestProvider } from "./context/HelperRequestContext";
import GlobalHelperRequestModal from "./components/GlobalHelperRequestModal/GlobalHelperRequestModal";
import HelperConfirmedNotification from "./components/HelperConfirmedNotification/HelperConfirmedNotification";
import NotFound from "./pages/notfound/NotFound";


function App() {
  return (
    <RatingProvider>
      <HelperRequestProvider>
        <GlobalRatingModal />
        <GlobalHelperRequestModal />
        <HelperConfirmedNotification />
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
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rating"
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
        <Route
          path="/pending-helpers"
          element={
            <ProtectedRoute>
              <PendingHelpers />
            </ProtectedRoute>
          }
        />
         <Route path="*" element={<NotFound />} />      </Routes>
      </HelperRequestProvider>
    </RatingProvider>
  );
}

export default App;
