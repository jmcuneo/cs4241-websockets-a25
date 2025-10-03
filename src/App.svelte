<script>
  let msgs = []
  // bind username and input text to Svelte variables
  let username = ''
  let txt = ''

  // initialize username from localStorage if available
  if (typeof localStorage !== 'undefined') {
    username = localStorage.getItem('username') || ''
  }

  const ws = new WebSocket('ws://127.0.0.1:3000')

  // when connection is established...
  ws.onopen = () => {
    ws.send('a new client has connected.')
  }

  // handle incoming messages
  ws.onmessage = async msg => {
    const message = await msg.data.text()
    msgs = msgs.concat([message])
  }

  // persist username whenever it changes
  $: if (typeof localStorage !== 'undefined') {
    localStorage.setItem('username', username)
  }

  function send() {
    if (!txt) return
    ws.send(username + ':' + txt)
    msgs = msgs.concat(['me: ' + txt])
    txt = ''
  }
</script>

<input type='text' id='username' bind:value={username} placeholder='username' />
<input type='text' id='input' bind:value={txt} on:change={send} placeholder='message' />

{#each msgs as msg }
  <h3>{msg}</h3>
{/each}