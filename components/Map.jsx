"use client";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import CategoryLocations from "./CategoryLocations";
import { MarkerF } from "@react-google-maps/api";

const center = {
  lat: 38.6280278,
  lng: -90.1910154,
};

function Map({ results }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%', opacity: 0.8 }}
        center={center}
        zoom={12}
        options={{
          mapTypeControl: false,
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
  );
}
export default Map;
