<script>
  let msgs = []
  let guess = ""
  let welcomeMsg = ""

  const ws = new WebSocket('ws://127.0.0.1:3000')

  ws.onmessage = async msg => {
    const data = JSON.parse(msg.data)

    if (data.text.startsWith('Welcome')) {
      welcomeMsg = data.text
    } else {
      msgs = [...msgs, data.text]
    }

    if (data.reset) {
      setTimeout(() => { msgs = [] }, 2000)
    }
  }

  function sendGuess() {
    if (guess === "" || guess === null) return
    ws.send(guess.toString())
    guess = ""
  }
</script>

{#if welcomeMsg}
  <p><strong>{welcomeMsg}</strong></p>
{/if}

<input
  type="number"
  bind:value={guess}
  placeholder="Enter your guess"
  on:keydown={(e) => e.key === 'Enter' && sendGuess()}
/>
<button on:click={sendGuess}>Guess</button>

<ul>
  {#each msgs as msg}
    <li>{msg}</li>
  {/each}
</ul>
