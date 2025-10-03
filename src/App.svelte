<script>
    import {onMount} from "svelte";

    let isDrawing = $state(false);
    let ws, ctx;

    onMount(() => {
        ws = new WebSocket('ws://127.0.0.1:3000');

        const canvas = document.querySelector('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx = canvas.getContext('2d');

        ws.onopen = () => {
            ws.onmessage = async msg => {
                const pos = await msg.data.text();
                const [x, y] = pos.split(':').map(v => parseInt(v));

                ctx.fillStyle = 'red';

                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2, false);
                ctx.fill();
            }
        }
    });

    function draw(e) {
        if (!isDrawing) return;

        ws.send(`${e.pageX}:${e.pageY}`);
        ctx.fillStyle = 'yellow';

        ctx.beginPath();
        ctx.arc(e.pageX, e.pageY, 8, 0, Math.PI * 2, false);
        ctx.fill();
    }
</script>

<canvas onmouseup={() => isDrawing = false} onmousedown={() => isDrawing = true} onmousemove={draw}></canvas>