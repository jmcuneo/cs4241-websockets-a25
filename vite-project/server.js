// /*
// 1. Open up a socket server
// 2. Maintain a list of clients connected to the socket server
// 3. When a client sends a message to the socket server, forward it to all
// connected clients
// */
//
// import express from 'express'
// import http from 'http'
// import ViteExpress from 'vite-express'
// import { WebSocketServer } from 'ws'
//
// const app = express()
//
// const server = http.createServer( app ),
//     socketServer = new WebSocketServer({ server }),
//     clients = []
//
// socketServer.on( 'connection', client => {
//     console.log( 'connect!' )
//
//     // when the server receives a message from this client...
//     client.on( 'message', msg => {
//         // send msg to every client EXCEPT the one who originally sent it
//         clients.forEach( c => { if( c !== client ) c.send( msg ) })
//     })
//
//     // add client to client list
//     clients.push( client )
// })
//
//
// // server.listen( 3100 )
// // Listen on Render port
// const PORT = process.env.PORT || 3000
// server.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
//
// ViteExpress.bind( app, server )


import express from 'express'
import http from 'http'
import path from 'path'
import { WebSocketServer } from 'ws'

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })
const clients = []

// Serve the Svelte build output
app.use(express.static(path.join(__dirname, 'vite-project', 'dist')))

// For SPA routing, redirect all other requests to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'vite-project', 'dist', 'index.html'))
})

// WebSocket connections
wss.on('connection', ws => {
    console.log('client connected')
    ws.on('message', msg => {
        clients.forEach(c => {
            if (c !== ws && c.readyState === ws.OPEN) c.send(msg)
        })
    })
    clients.push(ws)
})

// Render port
const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
