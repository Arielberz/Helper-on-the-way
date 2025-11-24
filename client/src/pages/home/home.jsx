import React from "react";
import { Link } from "react-router-dom";
import MapLive from "../../components/MapLive/MapLive.jsx";
import { NavLink } from "react-router-dom";

export default function Home() {
  return (
    <>
     <NavLink 
              to="/profile"
              className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
            ></NavLink>
      <MapLive />
    </>
  );
}
