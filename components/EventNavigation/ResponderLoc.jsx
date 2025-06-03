import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import io from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Icons using image files
const responderIcon = new L.Icon({
  iconUrl: '/responder.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
  shadowSize: [41, 41],
});

const incidentIcon = new L.Icon({
  iconUrl: '/eventLoc.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [40, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ResponderLoc = ({ incident }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [remainingPath, setRemainingPath] = useState([]);
  const [error, setError] = useState(null);
  const [initialBounds, setInitialBounds] = useState(null);
  const mapRef = useRef();
  const socketRef = useRef(null);

  const isValidLocation = (location) => {
    return location && 
           typeof location[0] === 'number' && 
           typeof location[1] === 'number' &&
           !isNaN(location[0]) && 
           !isNaN(location[1]);
  };

  // Function to store position in localStorage
  const storePosition = (position) => {
    if (incident?.id && isValidLocation(position)) {
      localStorage.setItem(`responder_position_${incident.id}`, JSON.stringify(position));
    }
  };

  // Function to get stored position from localStorage
  const getStoredPosition = () => {
    if (incident?.id) {
      const stored = localStorage.getItem(`responder_position_${incident.id}`);
      if (stored) {
        try {
          const position = JSON.parse(stored);
          if (isValidLocation(position)) {
            return position;
          }
        } catch (e) {
          console.error('Error parsing stored position:', e);
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (!incident || !incident.responder_location || !incident.geometry?.location) {
      setError('Invalid incident data: Missing responder or incident location');
      return;
    }

    // Check if this is a fresh session (i.e., page reload)
    const isFreshSession = !sessionStorage.getItem('appSessionActive');
    if (isFreshSession) {
      sessionStorage.setItem('appSessionActive', 'true');
      // On page reload, clear the stored position to reset to initial location
      if (incident?.id) {
        localStorage.removeItem(`responder_position_${incident.id}`);
      }
    }

    // Get initial location: use stored position if available, otherwise use incident's responder location
    const storedPosition = getStoredPosition();
    const initialLocation = storedPosition || [
      incident.responder_location.lat,
      incident.responder_location.lng,
    ];

    const incidentLocation = [
      incident.geometry.location.lat,
      incident.geometry.location.lng,
    ];

    if (!isValidLocation(initialLocation) || !isValidLocation(incidentLocation)) {
      setError('Invalid initial responder or incident location coordinates');
      return;
    }

    setMarkerPosition(initialLocation);
    console.log('Initial responder location:', initialLocation);

    const bounds = L.latLngBounds([initialLocation, incidentLocation]);
    setInitialBounds(bounds);
  }, [incident]);

  useEffect(() => {
    if (!incident?.id) return;

    if (socketRef.current) {
      socketRef.current.emit('leaveIncident', incident.id);
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
    }

    const clientId = localStorage.getItem('clientId') || 'client-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('clientId', clientId);
    
    const newSocket = io('http://localhost:5000', {
      auth: { clientId },
      reconnection: false,
    });
    socketRef.current = newSocket;

    console.log('Socket initialized with clientId:', clientId);

    newSocket.removeAllListeners();

    newSocket.on('incidentData', (data) => {
      console.log('Received incident data:', data);
      if (data.routeInfo && data.routeInfo.path) {
        setPath(data.routeInfo.path);
        setRemainingPath(data.routeInfo.path);
      } else {
        setError('No route data available');
      }
    });

    newSocket.on('responderLocationUpdated', (data) => {
      console.log('Received location update:', data);
      // Handle both old format (array) and new format (object with position and bearing)
      const position = Array.isArray(data) ? data : data.position;
      if (isValidLocation(position)) {
        setMarkerPosition(position);
        // Store the position in localStorage whenever we receive an update
        if (incident?.id) {
          localStorage.setItem(`responder_position_${incident.id}`, JSON.stringify(position));
          console.log('Stored position in localStorage:', position);
        }
      } else {
        console.error('Invalid location update received:', data);
      }
    });

    newSocket.on('error', (errorMessage) => {
      console.error('Socket error:', errorMessage);
      setError(errorMessage);
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('joinIncident', incident.id);
      console.log('Joined incident room:', incident.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('forceDisconnect', (reason) => {
      console.log('Force disconnect received:', reason);
      newSocket.disconnect();
    });

    return () => {
      console.log('Cleaning up socket for incident:', incident.id);
      if (socketRef.current) {
        socketRef.current.emit('leaveIncident', incident.id);
        socketRef.current.disconnect();
        socketRef.current.removeAllListeners();
        socketRef.current = null;
      }
    };
  }, [incident]);

  useEffect(() => {
    if (path.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(path);
    }
  }, [path]);

  useEffect(() => {
    if (!markerPosition || path.length === 0) return;

    let closestIndex = 0;
    let minDistance = Infinity;

    path.forEach((point, index) => {
      const distance = Math.sqrt(
        Math.pow(markerPosition[0] - point[0], 2) +
        Math.pow(markerPosition[1] - point[1], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    const newRemainingPath = path.slice(closestIndex);
    setRemainingPath(newRemainingPath);
  }, [markerPosition, path]);

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
      ) : !markerPosition || !initialBounds ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-blue-600">
          Loading responder location...
        </div>
      ) : (
        <MapContainer
          bounds={initialBounds}
          boundsOptions={{ padding: [50, 50] }}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {remainingPath.length > 0 && (
            <>
              <Polyline 
                positions={remainingPath} 
                color="#2563eb"
                weight={6}
                opacity={0.9}
              />
              <Marker 
                position={markerPosition}
                icon={responderIcon}
                className="transition-all duration-200 ease-in-out"
              >
                <Popup className="custom-popup">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-800">Responder Location</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Lat: {markerPosition[0].toFixed(4)}
                    </p>
                    <p className="text-sm text-blue-600">
                      Lng: {markerPosition[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Marker 
                position={[incident.geometry.location.lat, incident.geometry.location.lng]}
                icon={incidentIcon}
                className="transition-all duration-200 ease-in-out"
              >
                <Popup className="custom-popup">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-semibold text-red-800">Incident Location</span>
                    </div>
                    <p className="text-sm text-red-600">
                      Lat: {incident.geometry.location.lat.toFixed(4)}
                    </p>
                    <p className="text-sm text-red-600">
                      Lng: {incident.geometry.location.lng.toFixed(4)}
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