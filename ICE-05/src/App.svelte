<script>
  let updates = []
  const ws = new WebSocket('ws://127.0.0.1:3000')

  ws.onmessage = async msg => {
    const message = await msg.data.text()
    updates = [...updates, message]
  }

  function send() {
    const input = document.querySelector('input').value
    if (!input) return
    ws.send(input)
    updates = [...updates, input]
    document.querySelector('input').value = ''
  }

  function getColor(update) {
    if (update.includes('+')) return 'limegreen'
    if (update.includes('-')) return 'red'
    return 'white'
  }

  function getIcon(update) {
    if (update.includes('+')) return '📈'
    if (update.includes('-')) return '📉'
    return '💹'
  }
</script>

<h2>💹 Real-Time Stock Ticker</h2>
<p>Type updates like <code>AAPL +2.5%</code> or <code>TSLA -1.2%</code></p>

<input type="text" placeholder="Enter stock update" on:change={send} />

<div style="margin-top:20px;">
  {#each updates as update}
    <h3 style="color: {getColor(update)};">
      {getIcon(update)} {update}
    </h3>
  {/each}
</div>
