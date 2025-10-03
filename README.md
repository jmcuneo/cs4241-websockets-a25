# ICE 05: Websockets

In this activity, you will work in groups to build a simple websockets application

### Instructions

1. Divide yourselves into groups of 3 - 5 students. **Make sure to register all your group members on Canvas so that you get credit.**

2. Implement the basic websockets setup demo from the [sockets guide](https://github.com/jmcuneo/cs4241-guides/blob/master/using.sockets.md). Make sure that is up and running correctly before proceeding to the next step.

3. Using the demo as a starting point, create a simple networked web application. Make sure the application can handle everybody in your group. Be creative, but manage your time and expectations wisely so that you have a complete application to submit by the end of class.

4. Write up a README file that includes the names of all of your group members and a description of what the application does. Be sure to list anything a user might need to know before using your application. Also describe any challenges your group faced.

5. Submit your final assignment by initiating a pull request against this repo.

**NOTE:** The demo uses Svelte, but you are welcome to switch to a different UI framework if you prefer.


## Collaborative Canvas with Fading Trails (Svelte + WebSockets)


A tiny real-time “multiplayer” drawing canvas. Each user is assigned a random color; strokes are broadcast over a WebSocket and rendered with a 2-second fade-out trail so the canvas stays clean while still showing recent activity.


### Features


-**Draw on an HTML "<canvas>" and see others’ strokes live**


-**Each user gets a random color from a small palette**


-**Trails fade out smoothly over ~2 seconds (configurable)**


-**Lightweight protocol (single JSON message per segment)**


-**WebSocket backend (simple relay)**


### Instructions

-**A WebSocket connects to ws://127.0.0.1:3100.**

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
