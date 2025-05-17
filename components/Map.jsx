"use client";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import CategoryLocations from "./CategoryLocations";
import { MarkerF } from "@react-google-maps/api";

const containerStyle = {
  width: "1470px",
  height: "665px",
};

const center = {
  lat: 38.6280278,
  lng: -90.1910154,
};

function Map({ results, category }) {
  return (
    <div className="relative opacity-80">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{
            mapTypeControl: false, // Hides the Map/Satellite toggle
            fullscreenControl: false,
          }}
        >
          <MarkerF
            position={center}
            icon={{
              url: `/YourLocation.png`,
              scaledSize: { width: 30, height: 30 },
            }}
          />
          <CategoryLocations results={results} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
export default Map;
