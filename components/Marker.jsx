import React from "react";
import { MarkerF } from "@react-google-maps/api";

function Marker({ place, category }) {
  const Schema = {
    Medical: { src: "/Medical.png", width: 48, height: 69 },
    Fire: { src: "/Fire.png", width: 48, height: 69 },
    "Medical-Equipment": {
      src: "/Medical-Equipment.png",
      width: 30,
      height: 30,
    },
    "Fire-Equipment": { src: "/Fire-Equipment.png", width: 30, height: 30 },
    Crime: { src: "/Crime.png", width: 48, height: 69 },
    Hospitals: { src: "/Hospitals.png", width: 30, height: 30 },
  };

  return (
    <MarkerF
      position={place.geometry.location}
      icon={{
        url: Schema[category].src,
        scaledSize: new window.google.maps.Size(
          Schema[category].height,
          Schema[category].width
        ),
      }}
    />
  );
}

export default Marker;
