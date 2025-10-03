# ICE 05 - WebSockets

Group Number and Members: 17 - Utku Yakar

## Description
This is a simple collaborative doodle board using Node.js, Express, and WebSockets.
Everyone who accesses the page is able to contribute to the same canvas in real time. My inspiration was Garctic.io.
Drawings are broadcasted to all the connected clients and new users can see the present board when they join.
There is a clear reset button that resets the canvas for everyone, because it gets cluttered quick.




## How to use
- Run npm install 
- Start the servers in two terminals:  
  - npm run dev (starts Vite)  
  - npm start (starts the WebSocket/Express server)  
- Open the local URL that Vite shows (usually http://localhost:3000)  
- Open in multiple tabs or browsers to see the shared drawing you are creating 
- Pick a color/size, click and drag to draw, press clear to reset

## Notes
- The board state is stored in the server’s memory, so if the server restarts the drawings are lost, so don't do that while testing
- Works for a couple people, but don't think it's super scalable

## Challenges
- At first the WebSocket server conflicted with Vite’s hot reload socket, causing infinite reconnects and you couldn't draw because of the refreshes. Fixed by putting the socket on a separate path (/draw).  
- Added simple in-memory history so that new clients can see what was already drawn, otherwise it was just a bad doodle tool.  