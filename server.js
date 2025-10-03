import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()
app.use(express.static('public'))


const server = http.createServer( app ),
    socketServer = new WebSocketServer({ server }),
    clients = []

socketServer.on( 'connection', client => {
    console.log( 'connect!',client )
    // when the server receives a message from this client...
    client.on( 'message', msg => {
        // send msg to every client EXCEPT the one who originally sent it
        clients.forEach( c => { if( c !== client ) c.send( msg ) })
    })

    // add client to client list
    clients.push( client )
})

server.listen( 3000 || process.env.PORT)

ViteExpress.bind( app, server )