
<script>
  let msgs = []

  const ws = new WebSocket( 'ws://127.0.0.1:3000' )

  // when connection is established...
  ws.onopen = () => {
    ws.send( 'a new client has connected.' )
    
    ws.onmessage = async msg => {
      // add message to end of msgs array,
      // re-assign to trigger UI update
      const message = await msg.data.text()
      let body = document.getElementById('app')
      try{
        body.style.backgroundColor = message.trim()
      }
      catch{

      }
      msgs = msgs.concat([ 'them: ' + message ])
    }
    
  }

  const send = function() {
    const txt = document.querySelector('input').value
    ws.send( txt )
    msgs = msgs.concat([ 'me: ' + txt ])
  }
</script>
<div>
  <input type='text' >
  <input type='submit' value='submit' on:click={send}><br>
</div>
  

<!-- {#await promise then something}
{/await} -->


{#each msgs as msg }
  <h3>{msg}</h3><br><br>
{/each}


