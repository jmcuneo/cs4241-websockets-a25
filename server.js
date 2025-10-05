const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'client.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } 
  else if (req.url === '/main.js') {
    fs.readFile(path.join(__dirname, 'main.js'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  } 
  else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  clients.add(ws);
  
  console.log(`Client connected. Total clients: ${clients.size}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: `Welcome! Current users: ${clients.size}`,
    totalClients: clients.size
  }));
  
  // Broadcast to all other users that someone joined
  broadcast(JSON.stringify({
    type: 'user_joined',
    message: `Someone joined the chat. Current users: ${clients.size}`,
    totalClients: clients.size
  }), ws);
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Message received:', message);
      
      // Broadcast the message to all users
      broadcast(JSON.stringify({
        type: 'message',
        message: message.text || message.message,
        totalClients: clients.size
      }));
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle user disconnection
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
    
    // Broadcast to remaining users that someone left
    broadcast(JSON.stringify({
      type: 'user_left',
      message: `Someone left the chat. Current users: ${clients.size}`,
      totalClients: clients.size
    }));
  });
  

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper function to broadcast message to all connected clients
function broadcast(message, excludeClient = null) {
  clients.forEach((client) => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
});
