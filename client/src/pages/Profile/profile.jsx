import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();
  const maxRating = 5;

  // For demo purposes, set a static rating
  const recentActions = []; // Can be populated from API later

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
        setUser(data.data?.user || data.user);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Show demo profile on error
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <div>
          <div >
            <p>טוען...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div >
        <div>
          <img src="/helper-logo.jpeg" alt="Helper On The Way"  />  

        <h1>פרופיל</h1>

        <div >
          <span >שם משתמש: {user?.username || "לא זמין"}</span>
        </div>

        <div >
          <span>אימייל: {user?.email || "לא זמין"}</span>
        </div>

        <div >
          <span>טלפון: {user?.phone || "לא זמין"}</span>
        </div>
        <div >
          <span>הדירוג שלי:</span>
          <div >
            {Array.from({ length: maxRating }).map((_, i) => (
              <span
                key={i}
                style={{ color: i < rating ? "#ffc107" : "#e4e5e9" }}
              >
                ★
              </span>
            ))}
            <span >
              {rating}/{maxRating}
            </span>
          </div>
        </div>

        <div >
          <span>פעולות אחרונות:</span>
          <ul >
            {recentActions.map((action, index) => (
              <li key={index} >
                <span>{action.title}</span>
                  {action.time && (
                    <span>{action.time}</span>
                  )}
                </li>
              ))}
            </ul>
        </div>
        <button onClick={() => navigate("/home")}>חזרה לדף הבית</button>

        <button onClick={handleLogout}>
          התנתק
        </button>
      </div>
    </div>
    </>
  );
};

export default Profile;
