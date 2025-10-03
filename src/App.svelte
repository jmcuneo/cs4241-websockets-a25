<script lang="ts">
  let msgs: string[] = []
      
  const ws = new WebSocket( 'ws://127.0.0.1:3000' )

  // when connection is established...
  ws.onopen = () => {
    ws.send( 'a new client has connected.' )

    ws.onmessage = async msg => {
      // add message to end of msgs array,
      // re-assign to trigger UI update
      const message: string = await msg.data.text()
      msgs = msgs.concat([ 'them: ' + message ])
      
    }
  }

  const send = function() {
    if (document === null){
      return;
    }
    else{
      //const txt: string|null = document.querySelector('input').value
      const temp: HTMLInputElement|null = document.querySelector('input')!
      const txt: string = temp.value;
      console.log()

      ws.send( txt )
      msgs = msgs.concat([ 'me: ' + txt ])
    }
    
  }
</script>

<input type='text' on:change={send} />

{#each msgs as msg }
  <h3>{msg}</h3>
{/each}