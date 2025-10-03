import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()

const server = http.createServer(app)
const socketServer = new WebSocketServer({ server, path: '/ws' })

let nextId = 1;
let gameDone = false;

function broadcast(obj) {
  const json = JSON.stringify(obj);
  socketServer.clients.forEach((c) => {
    if (c.readyState === 1) c.send(json);
  });
}

socketServer.on('connection', (socket) => {
  const id = nextId++;
  socket.send(JSON.stringify({ type: 'hello', id }));

  socket.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'reset') {
      gameDone = false;
      broadcast({ type: 'reset' });
      return;
    }

    if (msg.type === 'roll' && !gameDone) {
      const a = Math.floor(Math.random() * 6) + 1;
      const b = Math.floor(Math.random() * 6) + 1;
      const win = a === b;
      if (win) gameDone = true;
      broadcast({ type: 'roll', id, a, b, win });
    }
  });
});

ViteExpress.bind(app, server);

server.listen(3000, () => {
  console.log('Dev server on http://localhost:3000');
});