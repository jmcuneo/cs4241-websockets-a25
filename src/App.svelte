
<script>
    import { onMount } from "svelte";

    let isDrawing = false;
    let ws, ctx;
    let lastX, lastY;

    const myColor = `hsl(${Math.random() * 360}, 80%, 50%)`;

    onMount(() => {
        ws = new WebSocket('ws://127.0.0.1:3000');

        const canvas = document.querySelector('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');

        ws.onmessage = async msg => {
            const data = JSON.parse(await msg.data.text());

            if (data.clear) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                return;
            }

            if (data.x1 !== undefined) {
                // Line drawing
                ctx.strokeStyle = data.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(data.x1, data.y1);
                ctx.lineTo(data.x2, data.y2);
                ctx.stroke();
            }
        };
    });

    function draw(e) {
        if (!isDrawing) return;

        const payload = {
            x1: lastX ?? e.pageX,
            y1: lastY ?? e.pageY,
            x2: e.pageX,
            y2: e.pageY,
            color: myColor
        };

        // Draw locally
        ctx.strokeStyle = myColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(payload.x1, payload.y1);
        ctx.lineTo(payload.x2, payload.y2);
        ctx.stroke();

        // Broadcast to others
        ws.send(JSON.stringify(payload));

        lastX = e.pageX;
        lastY = e.pageY;
    }

    function startDrawing(e) {
        isDrawing = true;
        lastX = e.pageX;
        lastY = e.pageY;
    }

    function stopDrawing() {
        isDrawing = false;
        lastX = lastY = null;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ws.send(JSON.stringify({ clear: true }));
    }
</script>

<style>
    canvas {
        border: 1px solid #ccc;
        display: block;
    }
    button {
        position: fixed;
        top: 10px;
        left: 10px;
        padding: 8px 12px;
        font-size: 14px;
        cursor: pointer;
        background: red;
        color: white;
        border: none;
        border-radius: 4px;
    }
</style>

<button on:click={clearCanvas}>Clear Canvas</button>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<canvas
    on:mousedown={startDrawing}
    on:mouseup={stopDrawing}
    on:mouseleave={stopDrawing}
    on:mousemove={draw}
/>