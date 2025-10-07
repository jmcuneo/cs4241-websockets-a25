<!--
<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
</script>

<main>
  <div>
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
-->


<script>
    import {onMount} from 'svelte'

    let msgs = []
    let input = ''
    let username = 'Anonymous'
    const ws = new WebSocket('ws://127.0.0.1:3821');

    ws.onopen = () => {
        ws.send("someone has joined");
        ws.onmessage = (event) => {
            msgs = [...msgs, event.data];
        }
    }

    function send() {
        const message = `${username} said: ${input}`;
        ws.send(message);
        msgs = [...msgs, message];
        input = '';
    }

    function handleKeydown(event) {
        if (event.key === "Enter") {
            send();
        }
    }


</script>

<main class="d-flex flex-column vh-25">

    <h1 class="mb-1">
        Elijah's Chat Room
    </h1>

    <label for="username" class="form-label">Enter your username:</label>
    <input id="username" type="text" class="form-control" placeholder="Anonymous is default"
           bind:value={username}
    />

    <div class="flex-grow-1 overflow-auto">

        {#each msgs as msg}
            <div>{msg}</div>
        {/each}

    </div>

    <input class="form-control" placeholder="Type here"
           bind:value={input}
           on:keydown={handleKeydown}
    />

</main>