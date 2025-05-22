import React, { useState } from "react";
import { MarkerF } from "@react-google-maps/api";
import EventInfo from "./EventNavigation/EventInfo";

function Marker({ place, category }) {
  const [click, setclick] = useState(false);
  const Icon = {
    Medical: { src: "/Medical.png", width: 30, height: 60 },
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
    <MarkerF
      position={place.geometry.location}
      icon={{
        url: Icon[category].src,
        scaledSize: new window.google.maps.Size(
          Icon[category].width,
          Icon[category].height
        ),
      }}
      onClick={() => setclick(!click)}
    >
      {/* <EventInfo event={corresponding_event} /> */}
    </MarkerF>
  );
}

export default Marker;
