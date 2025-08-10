const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active connections and maps
const connections = new Map();
const mindMaps = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  const userId = socket.handshake.query.userId;
  connections.set(socket.id, { userId, socket });

  // Join a specific mind map room
  socket.on('join-map', (mapId) => {
    socket.join(mapId);
    console.log(`User ${userId} joined map ${mapId}`);
  });

  // Node operations
  socket.on('add-node', (node) => {
    socket.broadcast.emit('node-added', node);
  });

  socket.on('update-node', ({ nodeId, updates }) => {
    socket.broadcast.emit('node-updated', nodeId, updates);
  });

  socket.on('delete-node', (nodeId) => {
    socket.broadcast.emit('node-deleted', nodeId);
  });

  // Edge operations
  socket.on('add-edge', (edge) => {
    socket.broadcast.emit('edge-added', edge);
  });

  socket.on('delete-edge', (edgeId) => {
    socket.broadcast.emit('edge-deleted', edgeId);
  });

  // Comment operations
  socket.on('add-comment', (comment) => {
    socket.broadcast.emit('comment-added', comment);
  });

  // AI operations
  socket.on('ai-request', async (command) => {
    try {
      // Mock AI response - in production, integrate with OpenAI API
      const mockResponse = await generateMockAIResponse(command);
      socket.emit('ai-response', mockResponse);
    } catch (error) {
      console.error('AI request failed:', error);
      socket.emit('ai-response', { error: 'AI request failed' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connections.delete(socket.id);
  });
});

// Mock AI response generator
async function generateMockAIResponse(command) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  const responses = {
    'project management': [
      'Agile Methodology',
      'Scrum Framework',
      'Kanban Board',
      'Sprint Planning',
      'Daily Standups',
      'Retrospectives'
    ],
    'marketing': [
      'Digital Marketing',
      'Content Strategy',
      'Social Media',
      'SEO Optimization',
      'Email Campaigns',
      'Analytics'
    ],
    'design': [
      'User Research',
      'Wireframing',
      'Prototyping',
      'User Testing',
      'Visual Design',
      'Accessibility'
    ]
  };

  const prompt = command.prompt.toLowerCase();
  let suggestions = [];

  for (const [key, values] of Object.entries(responses)) {
    if (prompt.includes(key)) {
      suggestions = values;
      break;
    }
  }

  if (suggestions.length === 0) {
    suggestions = ['Concept 1', 'Concept 2', 'Concept 3'];
  }

  return {
    type: 'nodes',
    suggestions: suggestions.map((text, index) => ({
      id: `ai-${Date.now()}-${index}`,
      content: text,
      type: 'text'
    }))
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/maps', (req, res) => {
  res.json(Array.from(mindMaps.values()));
});

app.post('/api/maps', (req, res) => {
  const map = req.body;
  map.id = Date.now().toString();
  mindMaps.set(map.id, map);
  res.json(map);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };