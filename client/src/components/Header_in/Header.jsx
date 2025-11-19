import React from "react";
import { NavLink } from "react-router-dom";
import "./Headr.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <img src="/helper-logo.jpeg" alt="Helper Logo" className="logo-image" />
          <h1 className="logo-text">Helper on the Way</h1>
        </div>
        
        <nav className="nav-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                בית
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                צ'אט
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/payment" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                תשלום
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/rating" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                דירוג
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                פרופיל
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="user-profile">
        </div>
      </div>
    </header>
  );
};

export default Header;
