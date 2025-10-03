<script>
    import {onMount} from "svelte";

    let ws, msgs = [], ctx = null

    onMount(() => {
        ws = new WebSocket( 'ws://127.0.0.1:3000' )

        ws.onopen = () => {
            ws.onmessage = async msg => {
                const pos = await msg.data.text()
                const [x,y] = pos.split( ':' ).map( v => parseInt(v) )

                ctx.fillStyle = 'red'
                ctx.fillRect( x,y,50,50 )
            }
        }

        const canvas = document.querySelector('canvas')
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx = canvas.getContext( '2d' )

        window.onclick = e => {
            ws.send( `${e.pageX}:${e.pageY}` )
            ctx.fillStyle = 'yellow'
            ctx.fillRect( e.pageX,e.pageY,50,50 )
        }
    });
</script>

<canvas></canvas>