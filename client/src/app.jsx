/*
  קובץ זה אחראי על:
  - הגדרת מסלולי הניתוב (Routes) הראשיים של האפליקציה
  - עטיפת קומפוננטות בספקי קשר (RatingProvider, HelperRequestProvider)
  - הגדרת מסלולים מוגנים (ProtectedRoute) ופומביים (PublicRoute)
  - מבנה כללי של ניווט בין דפי המשתמש, אדמין, צ'אט ומפה

  הקובץ משמש את:
  - main.jsx שמרנדר אותו בתוך BrowserRouter
  - React Router לצורך ניווט בין דפים

  הקובץ אינו:
  - מכיל לוגיקה עסקית או קריאות API
  - מטפל באימות משתמשים (זה תפקיד ProtectedRoute)
*/

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

import PayPalSuccess from "./pages/PayPal/PayPalSuccess";
import PayPalCancel from "./pages/PayPal/PayPalCancel";
import Terms from "./pages/Terms/Terms";
import Privacy from "./pages/Privacy/Privacy";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import PhoneVerification from "./pages/PhoneVerification/PhoneVerification";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import { RatingProvider } from "./context/RatingContext";
import GlobalRatingModal from "./components/GlobalRatingModal/GlobalRatingModal";
import { HelperRequestProvider } from "./context/HelperRequestContext";

import HelperConfirmedNotification from "./components/HelperConfirmedNotification/HelperConfirmedNotification";
import NotFound from "./pages/notfound/NotFound";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersTable from "./pages/Admin/UsersTable";
import RequestsTable from "./pages/Admin/RequestsTable";
import TransactionsTable from "./pages/Admin/TransactionsTable";
import ReportsTable from "./pages/Admin/ReportsTable";
import ContactMessagesTable from "./pages/Admin/ContactMessagesTable";
import AdminDebugPage from "./pages/Admin/AdminDebugPage";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

// Wrapper component to ensure RatingProvider is active before GlobalRatingModal renders
function RatingModalWrapper() {
  return <GlobalRatingModal />;
}

function App() {
  return (
    <RatingProvider>
      <HelperRequestProvider>
        <ScrollToTop />
        <RatingModalWrapper />

        <HelperConfirmedNotification />
        <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/phone-verification"
          element={
            <ProtectedRoute>
              <PhoneVerification />
            </ProtectedRoute>
          }
        />
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
        

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="requests" element={<RequestsTable />} />
          <Route path="transactions" element={<TransactionsTable />} />
          <Route path="reports" element={<ReportsTable />} />
          <Route path="contact-messages" element={<ContactMessagesTable />} />
        </Route>


        <Route path="/admin-debug" element={<AdminDebugPage />} />

         <Route path="*" element={<NotFound />} />      </Routes>
      </HelperRequestProvider>
    </RatingProvider>
  );
}

export default App;
