import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()
const server = http.createServer(app)

// mount WS to a path
const socketServer = new WebSocketServer({ server, path: '/draw' })

// ttrack all the clients and their event history
const clients = new Set()
const HISTORY_LIMIT = 5000
let history = [] 

socketServer.on('connection', (client) => {
  console.log('WS: client connected')
  client.isAlive = true
  clients.add(client)

  // send history to new clients so they see
  try {
    client.send(JSON.stringify({ type: 'history', events: history }))
  } catch {}

  client.on('pong', () => { client.isAlive = true })

  client.on('message', (msg) => {
    let data = null
    try {
      data = JSON.parse(msg.toString())
    } catch {
      return
    }

    if (data?.type === 'draw') {
      // store draw
      const ev = {
        type: 'draw',
        x: Math.max(0, Math.floor(data.x ?? 0)),
        y: Math.max(0, Math.floor(data.y ?? 0)),
        color: String(data.color ?? '#000000').slice(0, 16),
        size: Math.max(1, Math.min(64, parseInt(data.size ?? 6, 10)))
      }
      history.push(ev)
      if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT)

      // broadcast
      for (const c of clients) if (c !== client && c.readyState === 1) c.send(JSON.stringify(ev))
    } else if (data?.type === 'clear') {
      // reset history and broadcast clearing signal
      history = []
      const ev = { type: 'clear' }
      for (const c of clients) if (c.readyState === 1) c.send(JSON.stringify(ev))
    }
  })

  client.on('close', () => {
    clients.delete(client)
    console.log('WS: client disconnected')
  })
})

// drop dead sockets
setInterval(() => {
  for (const c of clients) {
    if (c.isAlive === false) {
      c.terminate()
      clients.delete(c)
      continue
    }
    c.isAlive = false
    try { c.ping() } catch {}
  }
}, 30000)

ViteExpress.bind(app, server)

const PORT = 3000
server.listen(PORT, () => {
  console.log(`HTTP+WS listening on http://localhost:${PORT}`)
  console.log(`WebSocket endpoint at ws://127.0.0.1:${PORT}/draw`)
})