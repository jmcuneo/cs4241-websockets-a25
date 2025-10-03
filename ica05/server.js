import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()

const server = http.createServer(app)
const socketServer = new WebSocketServer({ server, path: '/ws' })
const clients = []

socketServer.on('connection', client => {
  console.log('connect!')
  client.on('message', msg => {
    clients.forEach(c => { if (c !== client) c.send(msg) })
  })
  clients.push(client)
})

ViteExpress.bind(app, server)
server.listen(3000, () => console.log('Dev server on http://localhost:3000'))