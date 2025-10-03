<script>
  import { onMount } from 'svelte';

  let canvasEl;
  let ctx;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  let ws;
  let userColor; // this user’s color
  const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231'];

  // assign a random color per user
  userColor = colors[Math.floor(Math.random() * colors.length)];

  // store other users’ cursors for fading effect
  let trails = [];

  onMount(() => {
    ctx = canvasEl.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;

    ws = new WebSocket(`${location.origin.replace(/^http/, 'ws')}`)
    //Local testing socket
    // ws = new WebSocket('ws://127.0.0.1:3000');

    ws.onopen = () => {
      console.log('Connected to WebSocket server.');
    };

    ws.onmessage = async msg => {
      const data = JSON.parse(await msg.data.text());
      // add trail with timestamp for fading
      trails.push({...data, timestamp: Date.now()});
    };

    // Animation loop to redraw canvas with fading effect
    const animate = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const now = Date.now();
      trails = trails.filter(t => now - t.timestamp < 2000); // keep last 2 seconds

      trails.forEach(t => {
        const age = (now - t.timestamp) / 2000; // 0 -> 1
        const alpha = 1 - age; // fade out
        drawLine(t.x1, t.y1, t.x2, t.y2, t.color, alpha);
      });

      requestAnimationFrame(animate);
    };
    animate();
  });

  const drawLine = (x1, y1, x2, y2, color = 'black', alpha = 1) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.globalAlpha = 1; // reset alpha
  };

  const startDrawing = e => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  };

  const draw = e => {
    if (!isDrawing) return;

    const newX = e.offsetX;
    const newY = e.offsetY;

    // draw locally immediately
    trails.push({x1: lastX, y1: lastY, x2: newX, y2: newY, color: userColor, timestamp: Date.now()});

    // send to server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        x1: lastX,
        y1: lastY,
        x2: newX,
        y2: newY,
        color: userColor
      }));
    }

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

<h2>Collaborative Canvas with Fading Trails 🎨</h2>
<canvas
        bind:this={canvasEl}
        width={800}
        height={600}
        on:mousedown={startDrawing}
        on:mousemove={draw}
        on:mouseup={stopDrawing}
        on:mouseleave={stopDrawing}
/>
