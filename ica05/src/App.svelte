<script>
  let myId = null;
  let a = null, b = null;
  let winner = null;
      
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${scheme}://${location.host}/ws`)
  ws.addEventListener('message', (e) => {
    try {
      const m = JSON.parse(e.data);
      if (m.type === 'hello') myId = m.id;
      if (m.type === 'roll') {
        a = m.a; b = m.b;
        if (m.win) winner = m.id;
      }
      if (m.type === 'reset') {
        a = b = null;
        winner = null;
      }
    } catch {}
  });
  function roll()  { ws.send(JSON.stringify({ type: 'roll' })); }
  function reset() { ws.send(JSON.stringify({ type: 'reset' })); }
</script>

<div class="wrap">
  <h2>First to roll double dice!</h2>
  <p>You are Player {myId ?? '…'}</p>

  <div>
    <button on:click={roll} disabled={!!winner}>Roll dice</button>
    <button on:click={reset}>Reset</button>
  </div>

  <p>Last roll: {a ?? '-'} & {b ?? '-'}</p>

  {#if winner}
    <h3>Player {winner} won!</h3>
  {/if}
</div>
