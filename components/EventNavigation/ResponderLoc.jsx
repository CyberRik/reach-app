import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import io from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Approach 1: Custom Icons using Images
const responderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3095/3095049.png', // Ambulance icon (Responder)
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const incidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828804.png', // Warning icon (Incident)
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Approach 2: Custom Markers using SVG with L.divIcon (alternative, uncomment to use)
// const responderIcon = new L.divIcon({
//   html: `
//     <div class="flex flex-col items-center">
//       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
//         <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
//         <path d="M12 7h.01"></path>
//         <path d="M12 12h.01"></path>
//         <path d="M12 16h.01"></path>
//         <path d="M8 8h8"></path>
//       </svg>
//       <div class="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
//     </div>
//   `,
//   className: '', // Remove default Leaflet styles
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
//   popupAnchor: [0, -40],
// });

// const incidentIcon = new L.divIcon({
//   html: `
//     <div class="flex flex-col items-center">
//       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
//         <line x1="12" y1="9" x2="12" y2="13"></line>
//         <line x1="12" y1="17" x2="12.01" y2="17"></line>
//       </svg>
//       <div class="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
//     </div>
//   `,
//   className: '',
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
//   popupAnchor: [0, -40],
// });

const ResponderLoc = ({ incident }) => {
  const [markerPosition, setMarkerPosition] = useState([
    incident.responder_location.lat,
    incident.responder_location.lng,
  ]);
  const [path, setPath] = useState([]);
  const [error, setError] = useState(null);
  const mapRef = useRef();
  const socketRef = useRef();

  // Connect to socket.io and join the incident room
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    // Join the incident room
    socketRef.current.emit('joinIncident', incident.id);

    // Listen for initial incident data (including route)
    socketRef.current.on('incidentData', (data) => {
      if (data.routeInfo && data.routeInfo.path) {
        setPath(data.routeInfo.path);
      } else {
        setError('No route data available');
      }
    });

    // Listen for responder location updates
    socketRef.current.on('responderLocationUpdated', (location) => {
      setMarkerPosition(location);
    });

    // Listen for errors
    socketRef.current.on('error', (errorMessage) => {
      setError(errorMessage);
    });

    // Clean up on unmount
    return () => {
      socketRef.current.emit('leaveIncident', incident.id);
      socketRef.current.disconnect();
    };
  }, [incident.id]);

  // Fit map bounds to the path when it updates
  useEffect(() => {
    if (path.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(path);
    }
  }, [path]);

  // Invalidate map size after rendering to fix tile loading issues
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, []);

  return (
    <div className="relative h-[500px] w-full">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-600">
          {error}
        </div>
      ) : (
        <MapContainer
          center={[incident.geometry.location.lat, incident.geometry.location.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {path.length > 0 && (
            <>
              <Polyline positions={path} color="red" />
              {/* Responder Marker - Custom Ambulance Icon */}
              <Marker 
                position={markerPosition}
                icon={responderIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2 bg-blue-100 border border-blue-400 rounded-md shadow-sm">
                    <span className="font-semibold text-blue-800">Responder Location</span>
                    <p className="text-sm text-blue-600">
                      Lat: {markerPosition[0].toFixed(4)}, Lng: {markerPosition[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              {/* Incident Marker - Custom Warning Icon */}
              <Marker 
                position={[incident.geometry.location.lat, incident.geometry.location.lng]}
                icon={incidentIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2 bg-red-100 border border-red-400 rounded-md shadow-sm">
                    <span className="font-semibold text-red-800">Incident Location</span>
                    <p className="text-sm text-red-600">
                      Lat: {incident.geometry.location.lat.toFixed(4)}, Lng: {incident.geometry.location.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default ResponderLoc;