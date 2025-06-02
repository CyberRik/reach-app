require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active incidents and their data
const activeIncidents = new Map();

// Function to decode Google Maps polyline
const decodePolyline = (encoded) => {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
};

// Initialize mock data for testing
const initializeMockData = () => {
  const mockIncidents = [
    {
      id: "1",
      event_code: "MED-001",
      event_type: "Medical Emergency",
      category: "Medical",
      severity: "high",
      status: "active",
      status_message: "Responders en route",
      reportedAt: new Date().toISOString(),
      address: "123 Main St",
      geometry: {
        location: { lat: 40.7128, lng: -74.0060 }
      },
      responder_location: { lat: 40.7129, lng: -74.0061 },
      smart_tech_data: {
        heart_rate: "120 bpm",
        SpO2: "95%",
        temperature: "37.2°C"
      },
      assigned: {
        responders: ["EMS-001", "POL-001"],
        volunteers: {
          basic: ["Vol #122", "Vol #159"],
          Intermediate: ["Vol #12"],
          Advanced: []
        }
      },
      updates: [
        {
          headline: "CPR Initiated",
          description: "Volunteer #122 started CPR",
          time: new Date().toISOString()
        }
      ]
    },
    {
      id: "2",
      event_code: "FIRE-001",
      event_type: "Fire Emergency",
      category: "Fire",
      severity: "critical",
      status: "active",
      status_message: "Firefighters on scene",
      reportedAt: new Date().toISOString(),
      address: "456 Oak St",
      geometry: {
        location: { lat: 40.7130, lng: -74.0062 }
      },
      responder_location: { lat: 40.7131, lng: -74.0063 },
      smart_tech_data: {
        heart_rate: "N/A",
        SpO2: "N/A",
        temperature: "N/A"
      },
      assigned: {
        responders: ["FD-001", "EMS-002"],
        volunteers: {
          basic: ["Vol #123"],
          Intermediate: [],
          Advanced: ["Vol #160"]
        }
      },
      updates: [
        {
          headline: "Fire Contained",
          description: "Main fire has been contained",
          time: new Date().toISOString()
        }
      ]
    }
  ];

  mockIncidents.forEach(incident => {
    activeIncidents.set(incident.id, incident);
  });
};

initializeMockData();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinIncident', async (incidentId) => {
    socket.join(incidentId);
    console.log(`Client joined incident: ${incidentId}`);
    
    const incident = activeIncidents.get(incidentId);
    if (incident) {
      try {
        // Get route information from Google Directions API
        const startPoint = `${incident.responder_location.lat},${incident.responder_location.lng}`;
        const endPoint = `${incident.geometry.location.lat},${incident.geometry.location.lng}`;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${startPoint}&destination=${endPoint}&key=${apiKey}`
        );

        if (response.data.routes && response.data.routes.length > 0) {
          const route = response.data.routes[0];
          const leg = route.legs[0];
          
          // Decode the polyline to get the path coordinates
          const path = decodePolyline(route.overview_polyline.points);

          // Send initial data with route information
          socket.emit('incidentData', {
            ...incident,
            routeInfo: {
              distance: leg.distance.text,
              duration: leg.duration.text,
              endAddress: leg.end_address,
              startAddress: leg.start_address,
              path: path // Send decoded path as array of [lat, lng]
            }
          });

          // Emit marker position updates every 5 seconds
          let index = 0;
          const interval = setInterval(() => {
            if (index < path.length) {
              io.to(incidentId).emit('responderLocationUpdated', path[index]);
              index++;
            } else {
              clearInterval(interval);
            }
          }, 5000);

          // Clean up interval on client disconnect
          socket.on('disconnect', () => {
            clearInterval(interval);
          });
          socket.on('leaveIncident', () => {
            clearInterval(interval);
          });
        } else {
          socket.emit('incidentData', incident);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        socket.emit('incidentData', incident);
      }
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
          path: path // Send decoded path
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
    socket.leave(incidentId);
    console.log(`Client left incident: ${incidentId}`);
  });

  socket.on('updateResponderLocation', (data) => {
    const { incidentId, location } = data;
    const incident = activeIncidents.get(incidentId);
    if (incident) {
      incident.responder_location = location;
      activeIncidents.set(incidentId, incident);
      io.to(incidentId).emit('responderLocationUpdated', location);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API Routes
app.get('/api/incidents', (req, res) => {
  const incidents = Array.from(activeIncidents.values());
  res.json(incidents);
});

app.get('/api/incidents/:id', async (req, res) => {
  const incident = activeIncidents.get(req.params.id);
  if (incident) {
    try {
      const startPoint = `${incident.responder_location.lat},${incident.responder_location.lng}`;
      const endPoint = `${incident.geometry.location.lat},${incident.geometry.location.lng}`;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startPoint}&destination=${endPoint}&key=${apiKey}`
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        const path = decodePolyline(route.overview_polyline.points);
        
        const routeInfo = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          endAddress: leg.end_address,
          startAddress: leg.start_address,
          path: path // Send decoded path
        };
        
        res.json({ ...incident, routeInfo });
      } else {
        res.json(incident);
      }
    } catch (error) {
      console.error("Server API /api/incidents/:id: Error fetching route:", error);
      res.json(incident);
    }
  } else {
    res.status(404).json({ error: 'Incident not found' });
  }
});

app.post('/api/incidents', (req, res) => {
  const incident = req.body;
  activeIncidents.set(incident.id, incident);
  io.emit('newIncident', incident);
  res.status(201).json(incident);
});

app.put('/api/incidents/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const incident = activeIncidents.get(id);
  
  if (incident) {
    const updatedIncident = { ...incident, ...updates };
    activeIncidents.set(id, updatedIncident);
    io.to(id).emit('incidentUpdated', updatedIncident);
    res.json(updatedIncident);
  } else {
    res.status(404).json({ error: 'Incident not found' });
  }
});

app.post('/api/incidents/:id/updates', (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const incident = activeIncidents.get(id);
  
  if (incident) {
    if (!incident.updates) {
      incident.updates = [];
    }
    incident.updates.unshift({
      ...update,
      time: new Date().toISOString()
    });
    activeIncidents.set(id, incident);
    io.to(id).emit('incidentUpdated', incident);
    res.json(incident);
  } else {
    res.status(404).json({ error: 'Incident not found' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google Maps API Key loaded on server: ${process.env.GOOGLE_MAPS_API_KEY ? 'Loaded' : 'Not Loaded'}`);
});