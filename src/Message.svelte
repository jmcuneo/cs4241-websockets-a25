<script>
    let msgs = []

    const ws = new WebSocket( 'ws://127.0.0.1:3000' )

    // when connection is established...
    ws.onopen = () => {
        ws.send( 'a new client has connected.' )

        ws.onmessage = async msg => {
            // add message to end of msgs array,
            // re-assign to trigger UI update
            const message = JSON.parse(await msg.data.text())
            console.log(message)
            if( message.type === "text") {
                msgs = msgs.concat([ 'them: ' + message.text ])
            }
            if(msgs.length > 10) {
                msgs.shift()
            }
        }
    }

    const send = function() {
        const txt = document.querySelector('input').value
        const j = {text: txt, type: 'text'}
        ws.send( JSON.stringify( j ) )
        msgs = msgs.concat([ 'me: ' + txt ])

        if(msgs.length > 10) {
            msgs.shift()
        }
    }
</script>

<div class="fixed-chat">
    <input type='text' on:change={send} />

    {#each msgs as msg }
        <h3>{msg}</h3>
    {/each}
</div>