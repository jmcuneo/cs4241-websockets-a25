import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import ViteExpress from 'vite-express'

const app = express()

// Create HTTP server for Express/Vite
const server = http.createServer(app)

// Create separate WebSocket server on a different port
const wsServer = http.createServer()
const socketServer = new WebSocketServer({ server: wsServer })

// Enhanced client management
const clients = new Map()
const onlineUsers = new Map()

socketServer.on('connection', client => {
  console.log('New client connected.')
  const clientId = generateClientId()
  
  client.on('message', msg => {
    try {
      const data = JSON.parse(msg.toString())
      console.log('Received message:', data)
      
      switch(data.type) {
        case 'join':
          handleUserJoin(client, clientId, data)
          break
          
        case 'message':
          handleChatMessage(data)
          break
          
        case 'typing':
          handleTypingIndicator(data)
          break
          
        default:
          console.log('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Error parsing message:', error)
      // Handle legacy plain text messages
      broadcastMessage({
        type: 'message',
        user: 'Unknown',
        text: msg.toString(),
        timestamp: new Date().toISOString(),
        userId: 'legacy'
      })
    }
  })

  client.on('close', () => {
    handleUserLeave(clientId)
  })

  client.on('error', (error) => {
    console.error('WebSocket error:', error)
    handleUserLeave(clientId)
  })
})

function generateClientId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

function handleUserJoin(client, clientId, data) {
  const userInfo = {
    name: data.user,
    userId: data.userId,
    joinTime: new Date().toISOString()
  }
  
  // Store client info
  clients.set(clientId, {
    ws: client,
    user: userInfo,
    userId: data.userId,
    joinTime: new Date()
  })
  
  // Add to online users
  onlineUsers.set(data.userId, userInfo)
  
  console.log(`${data.user} (${data.userId}) joined the chat`)
  
  // Send user list to the new client
  client.send(JSON.stringify({
    type: 'userList',
    users: Array.from(onlineUsers.values())
  }))
  
  // Broadcast join notification to all other clients
  broadcastMessage({
    type: 'userJoined',
    user: data.user,
    userId: data.userId,
    timestamp: new Date().toISOString(),
    users: Array.from(onlineUsers.values())
  }, clientId)
}

function handleChatMessage(data) {
  console.log(`Message from ${data.user}: ${data.text}`)
  
  // Broadcast message to all clients
  broadcastMessage({
    type: 'message',
    user: data.user,
    text: data.text,
    userId: data.userId,
    timestamp: data.timestamp || new Date().toISOString()
  })
}

function handleTypingIndicator(data) {
  // Broadcast typing indicator to all other clients
  broadcastMessage({
    type: 'typing',
    user: data.user,
    isTyping: data.isTyping
  }, findClientIdByUserId(data.userId))
}

function handleUserLeave(clientId) {
  const clientInfo = clients.get(clientId)
  if (clientInfo) {
    const { user, userId } = clientInfo
    
    // Remove from clients and online users
    clients.delete(clientId)
    onlineUsers.delete(userId)
    
    console.log(`${user.name} (${userId}) left the chat`)
    
    // Broadcast leave notification
    broadcastMessage({
      type: 'userLeft',
      user: user.name,
      userId: userId,
      timestamp: new Date().toISOString(),
      users: Array.from(onlineUsers.values())
    })
  }
}

function broadcastMessage(message, excludeClientId = null) {
  const messageStr = JSON.stringify(message)
  
  clients.forEach((clientInfo, clientId) => {
    if (clientId !== excludeClientId && clientInfo.ws.readyState === 1) {
      try {
        clientInfo.ws.send(messageStr)
      } catch (error) {
        console.error('Error sending message to client:', error)
        // Clean up disconnected client
        clients.delete(clientId)
        if (clientInfo.userId) {
          onlineUsers.delete(clientInfo.userId)
        }
      }
    }
  })
}

function findClientIdByUserId(userId) {
  for (const [clientId, clientInfo] of clients) {
    if (clientInfo.userId === userId) {
      return clientId
    }
  }
  return null
}

// Cleanup disconnected clients every 30 seconds
setInterval(() => {
  let cleanedUp = 0
  clients.forEach((clientInfo, clientId) => {
    if (clientInfo.ws.readyState !== 1) {
      clients.delete(clientId)
      if (clientInfo.userId) {
        onlineUsers.delete(clientInfo.userId)
      }
      cleanedUp++
    }
  })
  
  if (cleanedUp > 0) {
    console.log(`Cleaned up ${cleanedUp} disconnected clients`)
    broadcastMessage({
      type: 'userList',
      users: Array.from(onlineUsers.values())
    })
  }
}, 30000)

// Start WebSocket server on port 8080
wsServer.listen(8080, () => {
  console.log('Chat Server listening on ws://localhost:8080')
})

// Start HTTP/Vite server on port 3000
server.listen(3000, () => {
  console.log('HTTP server listening on http://localhost:3000')
})

ViteExpress.bind(app, server)
