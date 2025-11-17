import React from "react";
import { NavLink } from "react-router-dom";
import "./LandingHeader.css";

const LandingHeader = () => {
  return (
    <header className="landing-header">
      <div className="header-container">
        <NavLink to="/" className="logo-link">
          <img src="./logo.png" alt="Logo" className="logo-img" />
          <h1 className="app-title">HELPER-ON-THE-WAY</h1>
        </NavLink>
        <nav>
          <ul className="nav-menu">
            <li>
              <NavLink to="/login" className="nav-link login-link">
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className="nav-link register-link">
                Register
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;
