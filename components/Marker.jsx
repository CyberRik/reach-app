import React, { useState } from "react";
import { MarkerF, InfoWindow } from "@react-google-maps/api";
import CustomInfoWindow from "./CustomInfoWindow";

function Marker({ place, category }) {
  const alerts = ["Medical", "Crime", "Fire"];
  const [showInfo, setShowInfo] = useState(false);
  const Icon = {
    Medical: { src: "/Medical.png", width: 30, height: 45 },
    Fire: { src: "/Fire.png", width: 30, height: 60 },
    "Medical-Equipment": {
      src: "/Medical-Equipment.png",
      width: 30,
      height: 30,
    },
    "Fire-Equipment": { src: "/Fire-Equipment.png", width: 30, height: 30 },
    Crime: { src: "/Crime.png", width: 30, height: 60 },
    Hospitals: { src: "/Hospitals.png", width: 30, height: 30 },
  };

  return (
    <>
      <MarkerF
        position={place.geometry.location}
        icon={{
          url: Icon[category].src,
          scaledSize: new window.google.maps.Size(
            Icon[category].width,
            Icon[category].height
          ),
        }}
        onClick={() => setShowInfo(!showInfo)}
      />
      {showInfo && alerts.includes(category) && (
        <InfoWindow
          position={place.geometry.location}
          onCloseClick={() => setShowInfo(false)}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
          }}
        >
          <CustomInfoWindow event={place} onCloseClick={() => setShowInfo(false)} category={category} />
        </InfoWindow>
      )}
    </>
  );
}

export default Marker;
