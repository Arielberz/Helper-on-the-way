import React from "react";
import { Link } from "react-router-dom";
import Header_in from "../../components/header/Header.jsx";
import MapLive from "../../components/MapLive/MapLive.jsx";

export default function Home() {
  return (
    <>
      <Header_in />
      <MapLive />
    </>
  );
}
