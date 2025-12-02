import React, { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

export default function MapRefSetter({ setMapRef }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (map) {
      setMapRef(map);
    }
  }, [map, setMapRef]);

  return null;
}
