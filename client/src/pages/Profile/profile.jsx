import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RatingModal from "../../components/RatingModal/RatingModal";


const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [recentActions, setRecentActions] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [showRatings, setShowRatings] = useState(false);
  const [ratingCount, setRatingCount] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const navigate = useNavigate();
  const maxRating = 5;

  const maskEmail = (email) => {
    if (!email) return "לא זמין";
    const [username, domain] = email.split('@');
    return `${"*".repeat(username.length)}@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return "לא זמין";
    return "*".repeat(phone.length);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token ? "exists" : "missing");
      

      try {
        console.log("Fetching user profile...");
        const response = await fetch("http://localhost:3001/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          console.error("Failed to fetch user profile");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("User data received:", data);
        const userData = data.data?.user || data.user;
        setUser(userData);
        setRating(userData?.averageRating || 0);
        setRatingCount(userData?.ratingCount || 0);
        
        // Get the user ID - the sanitizeUser function returns 'id', not '_id'
        const userId = userData?.id || userData?._id;
        console.log("User ID for queries:", userId);
        console.log("Full user object:", userData);
        
        // Fetch user's ratings (as helper)
        if (userId && typeof userId === 'string' && userId.length > 0) {
          try {
            const ratingsResponse = await fetch(`http://localhost:3001/api/users/${userId}/ratings`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (ratingsResponse.ok) {
              const ratingsData = await ratingsResponse.json();
              console.log("Ratings data:", ratingsData);
              if (ratingsData.success) {
                setUserRatings(ratingsData.data?.ratings || []);
              }
            }
          } catch (error) {
            console.error("Failed to fetch ratings:", error);
          }
        }
        
        // Fetch user's requests (help asked for)
        const requestsResponse = await fetch("http://localhost:3001/api/requests/my-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Fetch requests where user is the helper - only if we have a valid user ID
        let helperResponse = null;
        
        if (userId && typeof userId === 'string' && userId.length > 0) {
          console.log("Fetching helper requests for user ID:", userId);
          try {
            helperResponse = await fetch(`http://localhost:3001/api/requests?helperId=${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log("Helper response status:", helperResponse.status);
          } catch (error) {
            console.error("Error fetching helper requests:", error);
          }
        } else {
          console.warn("Invalid user ID, skipping helper requests fetch");
        }
        
        const allActions = [];
        
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          console.log("My requests data:", requestsData);
          const requests = requestsData.data || [];
          console.log("Number of my requests:", requests.length);
          setMyRequests(requests);
          
          // Format requests as actions
          const requestActions = requests.map(req => ({
            title: `בקשת עזרה: ${getProblemTypeLabel(req.problemType)}`,
            time: new Date(req.createdAt).toLocaleDateString('he-IL'),
            status: req.status,
            type: 'requested',
            address: req.location?.address || 'כתובת לא זמינה',
            requestId: req._id,
            helper: req.helper
          }));
          
          allActions.push(...requestActions);
        } else {
          console.error("Failed to fetch my requests:", requestsResponse.status);
        }
        
        if (helperResponse && helperResponse.ok) {
          try {
            const helperData = await helperResponse.json();
            console.log("Helper data:", helperData);
            const myHelps = helperData.data || [];
            console.log("Number of times I helped:", myHelps.length);
            
            // Format help actions
            const helpActions = myHelps.map(req => ({
              title: `עזרתי ב: ${getProblemTypeLabel(req.problemType)}`,
              time: new Date(req.createdAt).toLocaleDateString('he-IL'),
              status: req.status,
              type: 'helped',
              address: req.location?.address || 'כתובת לא זמינה'
            }));
            
            allActions.push(...helpActions);
          } catch (error) {
            console.error("Error parsing helper data:", error);
          }
        } else if (helperResponse) {
          console.error("Failed to fetch helper data:", helperResponse.status);
          const errorText = await helperResponse.text();
          console.error("Error details:", errorText);
        }
        
        console.log("Total actions:", allActions.length);
        
        // Sort all actions by date (newest first)
        allActions.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActions(allActions);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const getProblemTypeLabel = (type) => {
    const labels = {
      'flat_tire': 'פנצ\'ר',
      'dead_battery': 'מצבר מת',
      'out_of_fuel': 'גמר דלק',
      'engine_problem': 'בעיית מנוע',
      'locked_out': 'נעול בחוץ',
      'accident': 'תאונה',
      'towing_needed': 'נדרש גרירה',
      'other': 'אחר'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': '⏳ ממתין',
      'assigned': '👤 שובץ',
      'in_progress': '🔄 בטיפול',
      'completed': '✅ הושלם',
      'cancelled': '❌ בוטל'
    };
    return labels[status] || status;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRateHelper = (action) => {
    // Find the full request object
    const request = myRequests.find(req => req._id === action.requestId);
    if (request) {
      setSelectedRequest(request);
      setShowRatingModal(true);
    }
  };

  const handleRatingSuccess = () => {
    setShowRatingModal(false);
    // Refresh the page data to show updated ratings
    window.location.reload();
  };

  const checkIfRequestRated = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/ratings/${requestId}/check`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data.data?.alreadyRated || false;
      }
    } catch (error) {
      console.error("Error checking rating status:", error);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 flex items-center gap-6">
            <img 
              src="/helper-logo.jpeg" 
              alt="Helper On The Way" 
              className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">פרופיל משתמש</h1>
              <p className="text-blue-100">ברוך הבא, {user?.username || "משתמש"}!</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            פרטים אישיים
          </h2>
          
          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">שם משתמש</p>
                <p className="text-lg text-gray-800 font-semibold">{user?.username || "לא זמין"}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">אימייל</p>
                <p className="text-lg text-gray-800 font-semibold">
                  {showEmail ? (user?.email || "לא זמין") : maskEmail(user?.email)}
                </p>
              </div>
              <button
                onClick={() => setShowEmail(!showEmail)}
                className="mr-2 p-2 rounded-lg hover:bg-green-200 transition-colors"
                aria-label={showEmail ? "Hide email" : "Show email"}
              >
                {showEmail ? (
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <svg className="w-6 h-6 text-purple-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">טלפון</p>
                <p className="text-lg text-gray-800 font-semibold" dir="ltr">
                  {showPhone ? (user?.phone || "לא זמין") : maskPhone(user?.phone)}
                </p>
              </div>
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="mr-2 p-2 rounded-lg hover:bg-purple-200 transition-colors"
                aria-label={showPhone ? "Hide phone" : "Show phone"}
              >
                {showPhone ? (
                  <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            הדירוג שלי
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex gap-1 text-4xl">
              {Array.from({ length: maxRating }).map((_, i) => (
                <span
                  key={i}
                  className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="text-3xl font-bold text-gray-700">
              {rating > 0 ? rating.toFixed(1) : "אין דירוגים"}
            </div>
            {ratingCount > 0 && (
              <span className="text-sm text-gray-500">
                ({ratingCount} {ratingCount === 1 ? "דירוג" : "דירוגים"})
              </span>
            )}
          </div>

          {/* Show Ratings Button */}
          {userRatings.length > 0 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowRatings(!showRatings)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                {showRatings ? "הסתר דירוגים" : "הצג דירוגים"} ({userRatings.length})
              </button>
            </div>
          )}
        </div>

        {/* Ratings List */}
        {showRatings && userRatings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">⭐</span>
              דירוגים שקיבלתי
            </h3>
            <div className="space-y-4">
              {userRatings.map((ratingItem) => (
                <div
                  key={ratingItem._id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {ratingItem.rater?.username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          {ratingItem.rater?.username || "משתמש"}
                        </span>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, index) => (
                            <span
                              key={index}
                              className={`text-lg ${
                                index < ratingItem.score
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(ratingItem.createdAt).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                  {ratingItem.review && (
                    <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3 mt-2">
                      "{ratingItem.review}"
                    </p>
                  )}
                  {ratingItem.request?.problemType && (
                    <div className="mt-2 text-xs text-gray-500">
                      סוג בעיה: {getProblemTypeLabel(ratingItem.request.problemType)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Actions Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            הפעילות שלי
          </h2>
          
          {recentActions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">עדיין אין פעילות להצגה</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentActions.map((action, index) => (
                <li 
                  key={index} 
                  className={`p-4 rounded-lg hover:shadow-md transition-all border-r-4 ${
                    action.type === 'helped' 
                      ? 'bg-gradient-to-l from-green-50 to-white border-green-500' 
                      : 'bg-gradient-to-l from-blue-50 to-white border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {action.type === 'helped' ? (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className="text-gray-800 font-semibold">{action.title}</span>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      action.type === 'helped' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getStatusLabel(action.status)}
                    </span>
                  </div>
                  {action.address && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {action.address}
                    </div>
                  )}
                  {action.time && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {action.time}
                    </div>
                  )}
                  
                  {/* Rating Button for completed requests */}
                  {action.type === 'requested' && action.status === 'completed' && action.helper && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleRateHelper(action)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span>⭐</span>
                        <span>דרג את העוזר</span>
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/home")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            חזרה לדף הבית
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            התנתק
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedRequest && (
        <RatingModal
          requestId={selectedRequest._id}
          helperName={selectedRequest.helper?.username}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedRequest(null);
          }}
          onSubmitSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default Profile;
