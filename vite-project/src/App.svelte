<script>
  import { onMount } from 'svelte';

  let canvasEl;      // The <canvas> element itself
  let ctx;           // The 2D drawing context
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  let ws;

  onMount(() => {
    // Get the 2D context for drawing
    ctx = canvasEl.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;

    // --- WebSocket Connection ---
    ws = new WebSocket('ws://127.0.0.1:3100');

    ws.onopen = () => {
      console.log('Connected to WebSocket server.');
    };

    // Listen for drawing data from other clients
    ws.onmessage = async msg => {
      const data = JSON.parse(await msg.data.text());

      // Draw the line received from another user
      drawLine(data.x1, data.y1, data.x2, data.y2, data.color);
    };
  });

  // Main function to draw a line on the canvas
  const drawLine = (x1, y1, x2, y2, color = 'black') => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };


  // --- Mouse Event Handlers ---

  const startDrawing = (e) => {
    isDrawing = true;
    // Update the last known position
    [lastX, lastY] = [e.offsetX, e.offsetY];
  };

  const draw = (e) => {
    if (!isDrawing) return; // Stop if mouse is not down

    const newX = e.offsetX;
    const newY = e.offsetY;

    // 1. Draw on the local canvas immediately
    drawLine(lastX, lastY, newX, newY);

    // 2. Send the coordinates to the server to be broadcast
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        x1: lastX,
        y1: lastY,
        x2: newX,
        y2: newY,
        // You could even add color!
        // color: 'blue'
      }));
    }

    // 3. Update the last position for the next segment
    [lastX, lastY] = [newX, newY];
  };

  const stopDrawing = () => {
    isDrawing = false;
  };

</script>

<style>
  canvas {
    border: 1px solid black;
    cursor: crosshair;
  }
</style>

<h2>Collaborative Canvas 🎨</h2>
<canvas
  bind:this={canvasEl}
  width={800}
  height={600}
  on:mousedown={startDrawing}
  on:mousemove={draw}
  on:mouseup={stopDrawing}
  on:mouseleave={stopDrawing}
>
</canvas>

<!-- <input type='text' on:change={send} />

{#each msgs as msg }
  <h3>{msg}</h3>
{/each} -->