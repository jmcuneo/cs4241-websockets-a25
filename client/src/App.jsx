import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    let msgs = []

    const ws = new WebSocket( 'ws://127.0.0.1:3000' )

    // when connection is established...
    ws.onopen = () => {
        ws.send( 'a new client has connected.' )

        ws.onmessage = async msg => {
            // add message to end of msgs array,
            // re-assign to trigger UI update
            const message = await msg.data.text()
            msgs = msgs.concat([ 'them: ' + message ])
            }
    }

    const send = function() {
        const txt = document.querySelector('input').value
        ws.send( txt )
        msgs = msgs.concat([ 'me: ' + txt ])
    }


  return (
    <>
        <input type='text' onChange={send} />

        <h3>Message</h3>
        {msgs}
    </>
  )
}

export default App
