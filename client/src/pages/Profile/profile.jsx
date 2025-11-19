import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/header/Header";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const maxRating = 5;
  const rating = 4; // Default rating, you can make this dynamic later
  const recentActions = []; // Can be populated from API later

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token ? "exists" : "missing");
      
      if (!token) {
        console.log("No token found, using demo data");
        // Show demo profile without token
        setUser({
          username: "משתמש אורח",
          email: "guest@example.com",
          phone: "050-0000000"
        });
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching user profile...");
        const response = await fetch("http://localhost:3001/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          console.log("Server error, showing demo profile");
          // Show demo profile on error
          setUser({
            username: "משתמש אורח",
            email: "guest@example.com",
            phone: "050-0000000"
          });
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
        setUser({
          username: "משתמש אורח",
          email: "guest@example.com",
          phone: "050-0000000"
        });
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
        <Header />
        <div className={styles.page}>
          <div className={styles.card}>
            <p>טוען...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.card}>
          <img src="/helper-logo.jpeg" alt="Helper On The Way" className={styles.logo} />

        <h1 className={styles.title}>פרופיל</h1>

        <div className={styles.section}>
          <span className={styles.label}>שם משתמש:</span>
          <span className={styles.value}>{user?.username || "לא זמין"}</span>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>אימייל:</span>
          <span className={styles.value}>{user?.email || "לא זמין"}</span>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>טלפון:</span>
          <span className={styles.value}>{user?.phone || "לא זמין"}</span>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>הדירוג שלי:</span>
          <div className={styles.rating}>
            {Array.from({ length: maxRating }).map((_, i) => (
              <span
                key={i}
                className={i < rating ? styles.starFilled : styles.starEmpty}
              >
                ★
              </span>
            ))}
            <span className={styles.ratingNumber}>
              {rating}/{maxRating}
            </span>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>פעולות אחרונות:</span>
          {recentActions.length === 0 ? (
            <p className={styles.empty}>אין פעולות להצגה כרגע.</p>
          ) : (
            <ul className={styles.list}>
              {recentActions.map((action, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.actionTitle}>{action.title}</span>
                  {action.time && (
                    <span className={styles.actionTime}>{action.time}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={handleLogout} className={styles.logoutButton}>
          התנתק
        </button>
      </div>
    </div>
    </>
  );
};

export default Profile;
