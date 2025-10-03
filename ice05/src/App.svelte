<script>
  import { onMount } from 'svelte'

  let position = { x: 50, y: 50 }
  let scores = {}
  let ws
  let connected = false

  onMount(() => {
    ws = new WebSocket('ws://127.0.0.1:3000')

    ws.onopen = () => {
      connected = true
      console.log('Connected to server')
    }

    ws.onclose = () => {
      connected = false
      console.log('Disconnected from server')
    }

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)
        console.log('Received:', data)
        
        if (data.type === 'init' || data.type === 'update') {
          position = data.position
          scores = data.scores
        }
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    }
  })

  function handleClick() {
    if (connected && ws) {
      ws.send(JSON.stringify({ type: 'click' }))
      console.log('Click sent')
    }
  }
</script>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  :global(#app) {
    height: 100vh;
    width: 100vw;
  }

  .game-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  .button {
    position: absolute;
    transform: translate(-50%, -50%);
    padding: 20px;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
  }

  .scores {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(25, 55, 95, 0.9);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .score-item {
    margin: 5px 0;
    font-size: 16px;
  }
</style>

<div class="game-area">
  <button 
    class="button"
    style="left: {position.x}%; top: {position.y}%"
    on:click={handleClick}
  >
    Click me!
  </button>
</div>

<div class="scores">
  <h2>Scores:</h2>
  {#each Object.entries(scores).sort() as [id, score]}
    <div class="score-item">{id}: {score}</div>
  {/each}
</div>