import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()

const server = http.createServer(app),
  socketServer = new WebSocketServer({ server }),
  clients = []

const scores = new Map()
let currentPosition = { x: 50, y: 50 }
let playerCount = 0

function generateRandomPosition() {
  return {
    x: Math.floor(Math.random() * 95),
    y: Math.floor(Math.random() * 85)
  }
}

function broadcastToAll(data) {
  const message = JSON.stringify(data)
  clients.forEach(c => c.send(message))
}

socketServer.on('connection', client => {
  console.log('Client connected')
  playerCount++
  client.id = `player${playerCount}`
  scores.set(client.id, 0)
  clients.push(client)

  try {
    client.send(JSON.stringify({
      type: 'init',
      position: currentPosition,
      scores: Object.fromEntries(scores)
    }))
    console.log('Sent initial state to client')
  } catch (err) {
    console.error('Error sending initial state:', err)
  }

  client.on('message', message => {
    try {
      const data = JSON.parse(message.toString())
      console.log('Received message:', data)

      if (data.type === 'click') {
        scores.set(client.id, scores.get(client.id) + 1)
        currentPosition = generateRandomPosition()
        console.log('New position:', currentPosition)
        
        broadcastToAll({
          type: 'update',
          position: currentPosition,
          scores: Object.fromEntries(scores)
        })
      }
    } catch (err) {
      console.error('Error processing message:', err)
    }
  })

  client.on('close', () => {
    console.log('Client disconnected:', client.id)
    scores.delete(client.id)
    const index = clients.indexOf(client)
    if (index > -1) clients.splice(index, 1)
    
    broadcastToAll({
      type: 'update',
      position: currentPosition,
      scores: Object.fromEntries(scores)
    })
  })
})

server.listen( 3000 )

ViteExpress.bind( app, server )