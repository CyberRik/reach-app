import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import io from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Icons using online URLs
const responderIcon = new L.Icon({
  iconUrl: '/responder.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
  shadowSize: [41, 41],
});

const incidentIcon = new L.Icon({
  iconUrl: 'eventLoc.png',
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
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [etaTime, setEtaTime] = useState('');
  const [remainingDistance, setRemainingDistance] = useState('');
  const mapRef = useRef();
  const socketRef = useRef(null);

  const isValidLocation = (location) => {
    return location && 
           typeof location[0] === 'number' && 
           typeof location[1] === 'number' &&
           !isNaN(location[0]) && 
           !isNaN(location[1]);
  };

  // Calculate distance between two points in kilometers
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate remaining distance when path or marker position changes
  useEffect(() => {
    if (!markerPosition || remainingPath.length < 2) return;

    let totalDistance = 0;
    for (let i = 0; i < remainingPath.length - 1; i++) {
      totalDistance += calculateDistance(remainingPath[i], remainingPath[i + 1]);
    }

    // Format distance
    if (totalDistance < 1) {
      setRemainingDistance(`${Math.round(totalDistance * 1000)}m`);
    } else {
      setRemainingDistance(`${totalDistance.toFixed(1)}km`);
    }
  }, [markerPosition, remainingPath]);

  useEffect(() => {
    if (!incident || !incident.responder_location || !incident.geometry?.location) {
      setError('Invalid incident data: Missing responder or incident location');
      console.error('Invalid incident prop:', incident);
      return;
    }

    const initialLocation = [
      incident.responder_location.lat,
      incident.responder_location.lng,
    ];

    const incidentLocation = [
      incident.geometry.location.lat,
      incident.geometry.location.lng,
    ];

    if (!isValidLocation(initialLocation) || !isValidLocation(incidentLocation)) {
      setError('Invalid initial responder or incident location coordinates');
      console.error('Invalid coordinates:', { initialLocation, incidentLocation });
      return;
    }

    setMarkerPosition(initialLocation);
    console.log('Initial responder location set to:', initialLocation);

    const bounds = L.latLngBounds([initialLocation, incidentLocation]);
    setInitialBounds(bounds);
    console.log('Initial bounds set to:', bounds);
  }, [incident]);

  // Calculate ETA time when route info is received
  useEffect(() => {
    if (routeInfo?.duration) {
      const now = new Date();
      const durationMatch = routeInfo.duration.match(/(\d+)/);
      if (durationMatch) {
        const minutes = parseInt(durationMatch[1]);
        const eta = new Date(now.getTime() + minutes * 60000);
        setEtaTime(eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
  }, [routeInfo]);

  useEffect(() => {
    if (!incident?.id) {
      console.error('No incident ID provided');
      return;
    }

    setLoading(true);
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
      console.log('Received incidentData:', JSON.stringify(data, null, 2));
      if (data.routeInfo && data.routeInfo.path) {
        setPath(data.routeInfo.path);
        setRemainingPath(data.routeInfo.path);
        setRouteInfo(data.routeInfo);
        setLoading(false);
        console.log('Set path with length:', data.routeInfo.path.length);
      } else {
        setError('No route data available');
        setLoading(false);
        console.log('No route data in incidentData');
      }
    });

    newSocket.on('responderLocationUpdated', (data) => {
      console.log('Received responderLocationUpdated:', JSON.stringify(data, null, 2));
      const position = Array.isArray(data) ? data : data.position;
      if (isValidLocation(position)) {
        setMarkerPosition(position);
        console.log('Updated marker position to:', position);
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
      console.log('Map fit to path bounds');
    }
  }, [path]);

  useEffect(() => {
    if (!markerPosition || path.length === 0) {
      console.log('Skipping remainingPath update: markerPosition or path missing');
      return;
    }

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
    console.log('Updated remainingPath, length:', newRemainingPath.length);
  }, [markerPosition, path]);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
        console.log('Map size invalidated');
      }, 100);
    }
  }, []);

  return (
    <div className="relative h-[500px] w-full">
      <div className="nav-bar p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
        <div className="left">
          {loading && <span className="font-bold">Calculating Route...</span>}
          {error && <span className="font-bold text-red-600">Error: {error}</span>}
          {!loading && !error && routeInfo && (
            <>
              <span className="font-bold text-gray-700">{`Towards ${routeInfo.endAddress.split(',')[0]}`}</span>
              <span className="ml-2 text-gray-600">{remainingDistance}</span>
            </>
          )}
          {!loading && !error && !routeInfo && <span className="font-bold text-gray-600">No route found.</span>}
        </div>
        <div className="right">
          {loading && <span>ETA: Loading...</span>}
          {error && <span className="text-red-600">ETA: Error</span>}
          {!loading && !error && routeInfo && (
            <span className="text-gray-600">{`ETA: ${etaTime}`}</span>
          )}
        </div>
      </div>
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
          style={{ height: 'calc(100% - 64px)', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
            console.log('Map created');
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
                    {routeInfo && (
                      <>
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-sm text-blue-600">
                            Distance: {routeInfo.distance}
                          </p>
                          <p className="text-sm text-blue-600">
                            Duration: {routeInfo.duration}
                          </p>
                          <p className="text-sm text-blue-600">
                            From: {routeInfo.startAddress}
                          </p>
                          <p className="text-sm text-blue-600">
                            To: {routeInfo.endAddress}
                          </p>
                        </div>
                      </>
                    )}
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