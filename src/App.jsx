import {useEffect, useState} from 'react'
import './App.css'


function App() {

  const options = {
            Color: {r: 255, g: 255, b: 255},
            Width: 50
    }

  const pane = new Tweakpane.Pane();
  pane.addInput(options, 'Color');
    pane.addInput(options, 'Width', { min: 1, max: 200 }); // brush width


  const [count, setCount] = useState(0)
  const [msgs, setMsgs] = useState([])
  let ws = null
  let ctx = null

    useEffect(() => {
        ws = new WebSocket('ws://127.0.0.1:3000')

        ws.onopen = () => {
            ws.onmessage = async msg => {
                const pos = await msg.data.text()
                const data = JSON.parse(pos)
                const x = data.x
                const y = data.y


                ctx.fillStyle = data.color
                ctx.fillRect(x, y, data.size || 50, data.size || 50)
            }
        }

        const canvas = document.querySelector('canvas')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx = canvas.getContext('2d')

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }


        window.onmousemove = e => {
            if (e.buttons===1){
                const data = {
                    x: e.pageX,
                    y: e.pageY,
                    size: options.Width,
                    color: "rgba(" + options.Color.r + "," + options.Color.g + "," + options.Color.b + "," + "1)"
                }
                ws.send(JSON.stringify(data))
                ctx.fillStyle = "rgba(" + options.Color.r + "," + options.Color.g + "," + options.Color.b + "," + "1)"
                ctx.fillRect(e.pageX, e.pageY, options.Width, options.Width)
            }

        }
    })

    return (
        <>
            <canvas></canvas>
        </>
    )
}

export default App
