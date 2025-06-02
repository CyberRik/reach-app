import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const RealTimeTracker = () => {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState([14, 100]); // starting position
  const [polyline, setPolyline] = useState(null);
  const [path, setPath] = useState([[14, 100]]);

  useEffect(() => {
    // Initialize map
    const leafletMap = L.map('map').setView(position, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap);

    const marker = L.marker(position).addTo(leafletMap);
    const circle = L.circle(position, { radius: 20 }).addTo(leafletMap);
    const polyline = L.polyline(path, { color: 'red' }).addTo(leafletMap);

    setMap({ leafletMap, marker, circle });
    setPolyline(polyline);

    return () => {
      leafletMap.remove();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate position update
      setPosition(([lat, lng]) => [lat + 0.0005, lng + 0.0005]); // dummy increment
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (map && position) {
      const { leafletMap, marker, circle } = map;
      marker.setLatLng(position);
      circle.setLatLng(position);

      // Update path
      setPath(prev => {
        const updatedPath = [...prev, position];
        polyline.setLatLngs(updatedPath);
        return updatedPath;
      });

      leafletMap.panTo(position);
    }
  }, [position, map, polyline]);

  return (
    <div id="map" style={{ height: '500px', width: '100%' }}></div>
  );
};

export default RealTimeTracker;