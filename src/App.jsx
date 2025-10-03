import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'



function App() {
  const [count, setCount] = useState(0)
    const ws = new WebSocket( 'ws://127.0.0.1:3000' )
    const [msgs, setMsgs] = useState([])
// when connection is established...
    ws.onopen = () => {
        ws.send( 'a new client has connected.' )

        ws.onmessage = async msg => {
            // add message to end of msgs array,
            // re-assign to trigger UI update
            const message = await msg.data.text()
            setMsgs(  msgs.concat([ 'them: ' + message ]))
        }
    }

    const send = function() {
        const txt = document.querySelector('input').value
        ws.send( txt )
        setMsgs(msgs.concat([ 'me: ' + txt ]))
    }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
        <input type='text' onChange={send} />
        {
            msgs.map((msg) =>{
               return (<p>
                   {msg}
                </p>)
            })
        }
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
