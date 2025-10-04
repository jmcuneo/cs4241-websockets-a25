<script>
  let msgs = []
  let username = ''
  let connected = false
      
  const ws = new WebSocket( 'ws://127.0.0.1:3000' )

  // when connection is established...
  ws.onopen = () => {
    connected = true

    ws.onmessage = async msg => {
      // add message to end of msgs array,
      // re-assign to trigger UI update
      const message = await msg.data.text()
      msgs = msgs.concat([message])
    }
  }

  const connect = function() {
    username = document.querySelector('#username').value || 'Anonymous'
    ws.send(`${username} joined the chat`)
  }

  const send = function() {
    if (!username) return
    const txt = document.querySelector('#messageInput').value
    if (!txt) return
    
    ws.send(`${username}: ${txt}`)
    msgs = msgs.concat([`You: ${txt}`])
    document.querySelector('#messageInput').value = ''
  }
</script>

{#if !username}
  <div>
    <input id="username" type='text' placeholder="Enter your name" />
    <button on:click={connect}>Join Chat</button>
  </div>
{:else}
  <div>
    <p>Welcome, {username}!</p>
    <input id="messageInput" type='text' placeholder="Type a message..." on:keydown={(e) => e.key === 'Enter' && send()} />
    <button on:click={send}>Send</button>
  </div>
{/if}

{#each msgs as msg }
  <p>{msg}</p>
{/each}
