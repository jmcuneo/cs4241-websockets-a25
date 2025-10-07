import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import path from 'path'
import {WebSocketServer} from 'ws'

import {fileURLToPath} from 'url';

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'svelte-ws-example/dist')));

app.use(express.json());

const server = http.createServer( app ),
    socketServer = new WebSocketServer({ server }),
    clients = [], messages = []

socketServer.on( 'connection', client => {

    console.log("connect!")

    //load old messages
    messages.forEach(message => {
        if (client.readyState === client.OPEN) {client.send(message);}
    })

    //add client to the list
    clients.push(client);

    //https://stackoverflow.com/questions/48124638/how-does-the-client-on-function-really-work
    client.on('message', message => {

        const text_message = message.toString();
        messages.push(text_message)

        clients.forEach(c => {
            if (c !== client && c.readyState === c.OPEN) c.send(text_message)
        })
    })

})

server.listen(3821)

//ViteExpress.bind(app, server)