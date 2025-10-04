import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()
const server = http.createServer(app)
const socketServer = new WebSocketServer({ server })
const clients = []

socketServer.on('connection', client => {
  console.log('✅ New client connected')

  client.on('message', msg => {
    // broadcast to all except sender
    clients.forEach(c => {
      if (c !== client) c.send(msg)
    })
  })

  clients.push(client)
})

server.listen(3000, () => {
  console.log('🚀 WebSocket server running at ws://localhost:3000')
})

ViteExpress.bind(app, server)
