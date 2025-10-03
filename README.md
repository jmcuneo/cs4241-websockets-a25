# ICE 05: Websockets
## Collaborative Canvas with Fading Trails (Svelte + WebSockets)

Group 12: Ken Sebastian, Shawn Patel, Batyrkhan Saparuly, Rohit Tallapragada <br>

A tiny real-time “multiplayer” drawing canvas. Each user is assigned a random color; strokes are broadcast over a WebSocket and rendered with a 2-second fade-out trail so the canvas stays clean while still showing recent activity.


### Features


-**Draw on an HTML "<canvas>" and see others’ strokes live**


-**Each user gets a random color from a small palette (5 colors)**


-**Trails fade out smoothly over ~2 seconds (configurable)**


-**Lightweight protocol (single JSON message per segment)**


-**WebSocket backend (simple relay)**


### Instructions

-**A WebSocket connects to ws://127.0.0.1:3000.**

-**When you drag on the canvas, each small segment is**:

1. Pushed locally into a trails array for instant feedback

2. Sent as JSON over the socket to the server.

3. Incoming messages from other users are appended to trails.

-**A requestAnimationFrame loop**:

1. Clears the canvas each frame

2. Filters out trail items older than 2 seconds

3. Redraws remaining segments with alpha decreasing linearly from 1 → 0

Message format
{
  "x1": 10, "y1": 20,
  "x2": 40, "y2": 60,
  "color": "#color"
}

## To Run
- cd vite-project
- 'npm run dev' on one terminal
- 'npm start' or 'node server.js' on another terminal
- Open localhost link from npm run dev
- Duplicate page
- Draw (hold and drag mouse) and see the live strokes across the pages.
