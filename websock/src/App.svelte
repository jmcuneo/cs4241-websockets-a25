<script>
  
      
  const ws = new WebSocket( 'ws://127.0.0.1:3000' )
  let name = ''
  let message = ''
  let msgs = []
  // when connection is established...
  ws.onopen = () => {
    ws.send( 'a new client has connected.' )

    ws.onmessage = async msg => {
      // add message to end of msgs array,
      // re-assign to trigger UI update
      const message = await msg.data.text()
      const [recName, recText] = message.split(': ')
      msgs = msgs.concat([ message ])
    }
  }

  function send() {
    if (!message.trim()) return
    const text = `${name}: ${message}`
    ws.send(text)
    msgs = [...msgs, `Me: ${message}`]
    message = '' // clear input
  }

  function enter(e) {
    if (e.key === 'Enter') send()
  }

</script>
<div id="header">
  <h1>WebSocket Chat</h1>
  <p>Type a name and message and hit enter to send it to all other connected clients.</p>
</div>

<div id="inputArea">
  <input type='text' id="name" placeholder='Name' bind:value={name}/>
  <input type='text' id="message" placeholder='Message' bind:value={message} on:keydown={enter}/>
  <button on:click={send}>Send</button>
</div>

<div id="msgContainer">
{#each msgs as msg }
  <div class="msg {msg.startsWith('Me:') ? 'sent' : 'received'}">
    <h3>{msg}</h3>
  </div>
{/each}
</div>


<style>
#header {
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  background-color: lightgreen;
  width: 100%;
  height: 16%;
  padding-top: 10px;
  border-bottom: 2px solid lightgray;
}

h1 {
  margin: 0;
}

#msgContainer {
  position: absolute;
  top: 18%;
  height: 62%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  overflow-y: scroll;
  padding: 10px;
  border: solid lightgray;
  border-bottom: 0px;
  border-top: 0px;
}

h3 {
  margin: 0;
  padding: 0;
}

.msg {
  margin: 0px;
  padding: 5px 25px;
  margin-bottom: 6px;
  border: 2px solid dimgray;
  border-radius: 10px;
  max-width: 50%;
  word-wrap: break-word;
  width: fit-content;
}
.sent {
  background-color: lightgreen;
  margin-left: auto;
}

input {
  font-size: 16px;
  padding: 5px;
  margin: 5px;
  /* border: 2px solid lightgray; */
  border-radius: 5px;
}

button {
  font-size: 16px;
  padding: 5px 15px;
  margin: 5px;
  background-color: white;
  border: 2px solid dimgray;
  border-radius: 5px;
  cursor: pointer;
}

#inputArea {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  background-color: WhiteSmoke;
  border: 2px solid lightgray;
  border-radius: 10px;
  width: 60%;
  padding: 10px 10px;
  margin-bottom: 10px;
}
</style>