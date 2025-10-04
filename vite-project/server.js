import express from 'express'
import http from 'http'
import ViteExpress from 'vite-express'
import { WebSocketServer } from 'ws'

const app = express()
const server = http.createServer(app)
const socketServer = new WebSocketServer({ server })
const clients = new Map()

let secretNumber = Math.floor(Math.random() * 100) + 1
let playerCounter = 1

socketServer.on('connection', client => {
  const playerName = `Player ${playerCounter++}`
  clients.set(client, playerName)

  console.log(`${playerName} connected!`)
  client.send(JSON.stringify({ text: `Welcome ${playerName}! Start guessing between 1 and 100.` }))

  client.on('message', raw => {
    const guess = parseInt(raw.toString())
    const player = clients.get(client)

    let feedback = {}
    if (isNaN(guess)) {
      feedback = { text: `${player} sent an invalid guess. Please enter a number.` }
    } else if (guess < secretNumber) {
      feedback = { text: `${player} guessed ${guess} — too low` }
    } else if (guess > secretNumber) {
      feedback = { text: `${player} guessed ${guess} — too high` }
    } else {
      feedback = { 
        text: `🎉 ${player} guessed ${guess} correctly! The number was ${secretNumber}. Starting a new round...`,
        reset: true
      }
      secretNumber = Math.floor(Math.random() * 100) + 1
    }

    for (let c of clients.keys()) {
      c.send(JSON.stringify(feedback))
    }
  })

  client.on('close', () => {
    console.log(`${playerName} disconnected.`)
    clients.delete(client)
  })
})

server.listen(3000)
ViteExpress.bind(app, server)
