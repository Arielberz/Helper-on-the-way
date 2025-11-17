import React from "react";
import {NavLink} from "react-router-dom"; 

const LandingHeader = () => {
  return (
    <header>
      <h1>My App</h1>
      <nav>
        <ul>
          <li>
            <NavLink to="/"><img src="./logo.png" alt="Logo" /></NavLink>
          </li>
            <li>
            <NavLink to="/login">Login</NavLink>
          </li>
          <li>
            <NavLink to="/register">Register</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default LandingHeader;
