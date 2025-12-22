import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landing/landing";
import Register from "./pages/register/register";
import Login from "./pages/login/login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Home from "./pages/home/home";
import Chat from "./pages/chat/chat";
import Rating from "./pages/Rating/Rating";
import Profile from "./pages/Profile/profile";
import PendingHelpers from "./pages/PendingHelpers/PendingHelpers";
import PayPalSuccess from "./pages/PayPal/PayPalSuccess";
import PayPalCancel from "./pages/PayPal/PayPalCancel";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { RatingProvider } from "./context/RatingContext";
import GlobalRatingModal from "./components/GlobalRatingModal/GlobalRatingModal";
import { HelperRequestProvider } from "./context/HelperRequestContext";
import GlobalHelperRequestModal from "./components/GlobalHelperRequestModal/GlobalHelperRequestModal";
import HelperConfirmedNotification from "./components/HelperConfirmedNotification/HelperConfirmedNotification";
import NotFound from "./pages/notfound/NotFound";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersTable from "./pages/Admin/UsersTable";
import RequestsTable from "./pages/Admin/RequestsTable";
import TransactionsTable from "./pages/Admin/TransactionsTable";
import ReportsTable from "./pages/Admin/ReportsTable";
import AdminDebugPage from "./pages/Admin/AdminDebugPage";


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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
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
        <Route
          path="/paypal/success"
          element={
            <ProtectedRoute>
              <PayPalSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paypal/cancel"
          element={
            <ProtectedRoute>
              <PayPalCancel />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="requests" element={<RequestsTable />} />
          <Route path="transactions" element={<TransactionsTable />} />
          <Route path="reports" element={<ReportsTable />} />
        </Route>

        {/* Admin Debug Page */}
        <Route path="/admin-debug" element={<AdminDebugPage />} />

         <Route path="*" element={<NotFound />} />      </Routes>
      </HelperRequestProvider>
    </RatingProvider>
  );
}

export default App;
