/* 
1. Open up a socket server
2. Maintain a list of clients connected to the socket server
3. When a client sends a message to the socket server, forward it to all
connected clients
*/

import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import WebSocket, { WebSocketServer } from 'ws'

const app = express()

const server = http.createServer( app ),
      socketServer = new WebSocketServer({ server }),
      clients: WebSocket[] = []

socketServer.on( 'connection', client => {
  console.log( 'connect!' )
    
  // when the server receives a message from this client...
  client.on( 'message', msg => {
	  // send msg to every client EXCEPT the one who originally sent it
    clients.forEach( c => { if( c !== client ) c.send( msg ) })
  })

  // add client to client list
  clients.push( client )
})

app.post ( '/close', (req, res) =>{
  console.log("okay ill delete it ");
  process.exit(0);
})

server.listen( 3000 )

ViteExpress.bind( app, server )