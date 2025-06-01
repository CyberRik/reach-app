import React from "react";
import { MarkerF } from "@react-google-maps/api";

function Marker({ place, category }) {
  return (
    <MarkerF
      position={place.geometry.location}
      icon={{
        url: `/${category}.png`,
        scaledSize: new window.google.maps.Size(30, 30),
      }}
    />
  );
}

export default Marker;
