import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Header_in from "../../components/header/Header.jsx";
import MapLive from "../../components/MapLive/MapLive.jsx";

export default function Home() {
  return (
    <>
      <Header_in />
      <div className="home-page" dir="rtl" lang="he">
        <div className="home-card">
          {/* כותרת עליונה + לוגו */}
          <header className="header-welcome">
            <div className="header-title">
              <div className="header-title-main">שלום, מתנדב/ת</div>
              <div className="header-title-sub">
                ברוך/ה הבא/ה ל-Helper On The Way
              </div>
            </div>
            <img
              src="./helper-logo.jpeg"
              alt="Helper On The Way"
              className="logo-small"
            />
          </header>

          {/* מפה + טקסט */}
          <section className="map-card">
            {/* מפה חיה במקום תמונה */}
            <MapLive />
            <p className="map-caption">
              כאן תוכל לראות פניות לעזרה בסביבה שלך בזמן אמת.
            </p>
          </section>

          {/* כפתורים */}
          <section className="actions">
            <button className="btn-primary">
              בקשת סיוע עכשיו
            </button>
            <button className="btn-secondary">
              אני רוצה להתנדב
            </button>
          </section>

          {/* מידע נוסף */}
          <section>
            <div className="info-card">
              <div className="info-title">הפנייה האחרונה שלך</div>
              <div className="info-text">
                כרגע אין פניות פעילות. כשתיפתח בקשה חדשה, תראה אותה כאן.
              </div>
            </div>

            <div className="info-card">
              <div className="info-title">טיפ בטיחות</div>
              <div className="info-text">
                לפני יציאה לדרך ודא שהטלפון טעון, ושאתה חוגר חגורת בטיחות בכל נסיעה.
              </div>
            </div>
          </section>

          <div className="spacer"></div>

          {/* ניווט תחתון */}
          <nav className="bottom-nav">
            <Link to="/home" className="nav-item nav-item--active">
              <span>בית</span>
            </Link>
            <Link to="/chat" className="nav-item">
              <span>צ'אט</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <span>פרופיל</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
