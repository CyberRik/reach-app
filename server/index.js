require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const { decode } = require('@mapbox/polyline');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  pingTimeout: 2000,
  pingInterval: 5000
});

// Middleware
app.use(cors());
app.use(express.json());

// Store client-to-socket mapping to prevent duplicates
const clientSockets = new Map();
// Store socket-to-incident mapping for cleanup
const socketIncidents = new Map();
// Map to store intervals for each incident to clear them later
const incidentIntervals = new Map();

const decodePolyline = (encoded) => {
  return decode(encoded).map(coords => [coords[0], coords[1]]);
};

const interpolatePoints = (start, end, steps) => {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;
  const deltaLat = (endLat - startLat) / steps;
  const deltaLng = (endLng - startLng) / steps;
  const interpolated = [];
  for (let i = 1; i <= steps; i++) {
    interpolated.push([
      startLat + deltaLat * i,
      startLng + deltaLng * i
    ]);
  }
  return interpolated;
};

const calculateBearing = (start, end) => {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;
  const dLng = endLng - startLng;
  const y = Math.sin(dLng * (Math.PI / 180)) * Math.cos(endLat * (Math.PI / 180));
  const x = Math.cos(startLat * (Math.PI / 180)) * Math.sin(endLat * (Math.PI / 180)) -
            Math.sin(startLat * (Math.PI / 180)) * Math.cos(endLat * (Math.PI / 180)) * Math.cos(dLng * (Math.PI / 180));
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = (bearing + 360) % 360;
  return bearing;
};

// Function to fetch incident data from /api/alerts
const findIncidentById = async (incidentId) => {
  console.log(`Fetching data for incident with ID: ${incidentId}, Type: ${typeof incidentId}`);
  try {
    const response = await axios.get('http://localhost:5000/api/alerts');
    const categorizedAlerts = response.data;

    let allAlerts = [];
    for (const category in categorizedAlerts) {
      const alerts = categorizedAlerts[category]?.product?.results || [];
      allAlerts = allAlerts.concat(alerts);
    }

    const incident = allAlerts.find(alert => alert.id.toString() === incidentId.toString());
    if (!incident) {
      console.warn(`Incident with ID ${incidentId} not found in /api/alerts response`);
      return null;
    }

    return {
      id: incident.id.toString(),
      event_code: incident.event_code,
      event_type: incident.event_type,
      category: incident.category,
      severity: incident.severity || "high",
      status: incident.status || "active",
      status_message: incident.status_message || "Responders en route",
      reportedAt: new Date(incident.reportedAt),
      address: incident.address,
      geometry: incident.geometry,
      responder_location: incident.responder_location,
      smart_tech_data: incident.smart_tech_data || {},
      assigned: incident.assigned || { responders: [], volunteers: {} },
      updates: incident.updates || [],
      Media: incident.Media || {}
    };
  } catch (error) {
    console.error(`Error fetching incident ${incidentId} from /api/alerts:`, error.message);
    return null;
  }
};

io.on('connection', (socket) => {
  console.log('New client connected via Socket.IO:', socket.id);

  const clientId = socket.handshake.auth.clientId;
  if (!clientId) {
    console.error('No clientId provided, disconnecting socket:', socket.id);
    socket.disconnect(true);
    return;
  }

  // Clean up any existing socket for this client before assigning the new one
  if (clientSockets.has(clientId)) {
    const oldSocket = clientSockets.get(clientId);
    console.log(`Client ${clientId} already has a connection. Disconnecting old socket:`, oldSocket.id);
    const oldIncidentId = socketIncidents.get(oldSocket.id);
    if (oldIncidentId && incidentIntervals.has(oldIncidentId)) {
      console.log(`Clearing simulation interval for old socket ${oldSocket.id} incident ${oldIncidentId}`);
      clearTimeout(incidentIntervals.get(oldIncidentId));
      incidentIntervals.delete(oldIncidentId);
    }
    oldSocket.emit('forceDisconnect', 'Another connection opened');
    oldSocket.disconnect(true);
    socketIncidents.delete(oldSocket.id);
  }
  clientSockets.set(clientId, socket);

  socket.onAny((event, ...args) => {
    console.log(`Received event: ${event}`, args);
  });

  socket.on('joinIncident', async (incidentId) => {
    console.log(`Received joinIncident event with ID: ${incidentId}, Type: ${typeof incidentId}, Client: ${clientId}`);
    
    if (clientSockets.get(clientId) !== socket) {
      console.log(`Socket ${socket.id} is not the latest for client ${clientId}, rejecting joinIncident`);
      socket.emit('forceDisconnect', 'Superseded by newer connection');
      socket.disconnect(true);
      return;
    }

    // Clean up previous incident simulation if the socket was in another room
    const previousIncidentId = socketIncidents.get(socket.id);
    if (previousIncidentId && previousIncidentId !== incidentId && incidentIntervals.has(previousIncidentId)) {
      console.log(`Socket ${socket.id} leaving previous incident room ${previousIncidentId}. Clearing its simulation interval.`);
      clearTimeout(incidentIntervals.get(previousIncidentId));
      incidentIntervals.delete(previousIncidentId);
    }

    socket.join(incidentId);
    socketIncidents.set(socket.id, incidentId);
    console.log(`Client ${clientId} joined incident room: ${incidentId}`);

    const incident = await findIncidentById(incidentId);
    if (incident) {
      const startPoint = `${incident.responder_location.lat},${incident.responder_location.lng}`;
      const endPoint = `${incident.geometry.location.lat},${incident.geometry.location.lng}`;

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('GOOGLE_MAPS_API_KEY is not set.');
        socket.emit('incidentData', incident);
        return;
      }

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${startPoint}&destination=${endPoint}&key=${apiKey}`
        );

        if (response.data.routes && response.data.routes.length > 0) {
          const route = response.data.routes[0];
          const leg = route.legs[0];

          const path = decodePolyline(route.overview_polyline.points);

          socket.emit('incidentData', {
            ...incident,
            routeInfo: {
              distance: leg.distance.text,
              duration: leg.duration.text,
              endAddress: leg.end_address,
              startAddress: leg.start_address,
              path: path
            }
          });

          const detailedPath = [];
          const stepsPerSegment = 10;
          const baseInterval = 199;
          const baseSpeed = 1;

          for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];

            const bearing = calculateBearing(start, end);
            let nextBearing = i < path.length - 2 ? calculateBearing(path[i + 1], path[i + 2]) : bearing;
            const bearingDiff = Math.abs(nextBearing - bearing);
            const turnAngle = bearingDiff > 180 ? 360 - bearingDiff : bearingDiff;

            let speedFactor = baseSpeed;
            if (turnAngle > 90) {
              speedFactor *= 0.5;
            } else if (turnAngle > 45) {
              speedFactor *= 0.75;
            }

            const segmentPoints = interpolatePoints(start, end, stepsPerSegment);
            segmentPoints.forEach(point => {
              detailedPath.push({
                position: point,
                interval: baseInterval / speedFactor,
                bearing: bearing
              });
            });
          }

          let index = 0;
          const emitNextPosition = () => {
            if (index < detailedPath.length) {
              const { position, interval, bearing } = detailedPath[index];
              io.to(incidentId).emit('responderLocationUpdated', { position, bearing });
              index++;
              incidentIntervals.set(incidentId, setTimeout(emitNextPosition, interval));
            } else {
              console.log(`Simulation finished for incident ${incidentId}`);
              incidentIntervals.delete(incidentId);
            }
          };

          if (incidentIntervals.has(incidentId)) {
            console.log(`Clearing existing simulation interval for incident ${incidentId}`);
            clearTimeout(incidentIntervals.get(incidentId));
            incidentIntervals.delete(incidentId);
          }
          emitNextPosition();

          socket.on('disconnect', () => {
            console.log(`Client disconnected from incident room ${incidentId}`);
          });
          socket.on('leaveIncident', () => {
            console.log(`Client left incident room: ${incidentId}`);
          });

        } else {
           console.warn('No route found for incident:', incident.id);
           socket.emit('incidentData', incident);
        }
      } catch (error) {
        console.error('Error fetching route for incident', incident.id, ':', error);
        socket.emit('incidentData', incident);
      }
    } else {
      console.warn(`Incident with ID ${incidentId} not found by generator.`);
    }
  });

  socket.on('requestRoute', async (data) => {
    const { incidentId, start, end } = data;
    
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("Server: GOOGLE_MAPS_API_KEY not configured.");
        socket.emit('routeData', { error: "Server: API Key not configured." });
        return;
      }

      const startPoint = `${start.lat},${start.lng}`;
      const endPoint = `${end.lat},${end.lng}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startPoint}&destination=${endPoint}&key=${apiKey}`;
      console.log("Server: Attempting to fetch route from URL:", url);

      const response = await axios.get(url);
      console.log("Server: Google Directions API response status:", response.status);

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        const path = decodePolyline(route.overview_polyline.points);
        
        const routeInfo = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          endAddress: leg.end_address,
          startAddress: leg.start_address,
          path: path
        };
        
        console.log("Server: Route found, sending to client.");
        socket.emit('routeData', { routeInfo });
      } else {
        console.warn("Server: No routes found in API response.", response.data);
        socket.emit('routeData', { error: "No route found." });
      }
    } catch (error) {
      console.error("Server: Error fetching route:", error);
      socket.emit('routeData', { error: "Error fetching route: " + error.message });
    }
  });

  socket.on('leaveIncident', (incidentId) => {
    console.log(`Client left incident room: ${incidentId}`);
    socket.leave(incidentId);
    const clientId = socket.handshake.auth.clientId;
    if (clientId && clientSockets.has(clientId) && clientSockets.get(clientId).id === socket.id) {
    }
    socketIncidents.delete(socket.id);
  });

  socket.on('updateResponderLocation', async (data) => {
    const { incidentId, location } = data;
    const incident = await findIncidentById(incidentId);
    if (incident) {
      console.log(`Updating responder location for incident ${incidentId} to:`, location);
      io.to(incidentId).emit('responderLocationUpdated', location);
    } else {
       console.warn(`Cannot update location: Incident with ID ${incidentId} not found by generator.`);
    }
  });

  socket.on('forceDisconnect', (reason) => {
    console.log(`Client ${clientId} received forceDisconnect: ${reason}`);
    socket.disconnect(true);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const incidentId = socketIncidents.get(socket.id);
    if (incidentId && incidentIntervals.has(incidentId)) {
      const room = io.sockets.adapter.rooms.get(incidentId);
      if (!room || room.size === 0) {
        console.log(`No more clients in room ${incidentId}, clearing simulation interval.`);
        clearTimeout(incidentIntervals.get(incidentId));
        incidentIntervals.delete(incidentId);
      }
    }
    const clientId = socket.handshake.auth.clientId;
    if (clientId && clientSockets.has(clientId) && clientSockets.get(clientId).id === socket.id) {
      clientSockets.delete(clientId);
    }
    socketIncidents.delete(socket.id);
    console.log(`Cleaned up socket ${socket.id} for client ${clientId}`);
  });
});

// Temporary storage for alerts data
const alertsData = new Map();

// Initialize with mock data
const mockIncidents = {
  "45": {
    id: "45",
    event_code: "CVX",
    event_type: "Cardiac Event",
    category: "Medical",
    severity: "high",
    status: "active",
    status_message: "Responders en route",
    reportedAt: new Date(Date.now() - 5 * 60 * 1000),
    address: "1359 North 31st Street, East St. Louis, IL 62204",
    geometry: {
      location: {
        lat: 38.625196855855506,
        lng: -90.115183317234
      }
    },
    responder_location: {
      lat: 38.7,
      lng: -90.2
    },
    assigned: {
      responders: ["WGN-2021"],
      volunteers: {}
    }
  },
  "47": {
    id: "47",
    event_code: "F1V",
    event_type: "Structure Fire",
    category: "Fire",
    severity: "high",
    status: "active",
    status_message: "Responders en route",
    reportedAt: new Date(Date.now() - 10 * 60 * 1000),
    address: "90 Cedar Drive, Fairview Heights, East St. Louis, IL 62208",
    geometry: {
      location: {
        lat: 38.605196855855506,
        lng: -90.015183317234
      }
    },
    responder_location: {
      lat: 38.5,
      lng: -90.3
    },
    assigned: {
      responders: [],
      volunteers: { basic: ["#301"] }
    }
  }
};

// Add mock incidents to alertsData
Object.values(mockIncidents).forEach(incident => {
  alertsData.set(incident.id, incident);
});

app.get('/api/alerts', (req, res) => {
  const category = req.query.category;
  const allAlertsArray = Array.from(alertsData.values());

  const categorizedAlerts = {};
  allAlertsArray.forEach(alert => {
    if (!categorizedAlerts[alert.category]) {
      categorizedAlerts[alert.category] = { product: { results: [] } };
    }
    categorizedAlerts[alert.category].product.results.push(alert);
  });

  if (category && categorizedAlerts[category]) {
    console.log("Serving categorized alerts from server API:", category);
    res.json(categorizedAlerts[category]);
  } else if (category) {
    console.warn(`Category ${category} not found in alerts data.`);
    res.status(404).json({ error: `Category ${category} not found` });
  } else {
    console.log("Serving all categorized alerts from server API.");
    res.json(categorizedAlerts);
  }
});

app.post('/api/alerts', (req, res) => {
  const alert = req.body;
  if (!alert.id || !alert.category) {
    return res.status(400).json({ error: 'Alert must have an id and category' });
  }
  alertsData.set(alert.id, alert);
  console.log(`Added alert with ID ${alert.id} to alerts data`);
  res.status(201).json(alert);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google Maps API Key loaded on server: ${process.env.GOOGLE_MAPS_API_KEY ? 'Loaded' : 'Not Loaded'}`);
});