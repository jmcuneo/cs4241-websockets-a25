# ICE 05: Websockets

**Group 11
Ethan Knorring, Jack Richard, Owen Hart, Rohan Gladson**

Our application allows you to draw, using websockets, and to make guesses 
as to what is being drawn by other users.

You must run `node server.js` and `npm run dev` to get to the application.

- The biggest challenge was sending across two different types of messages through
the same websocket, but the websocket server code was untouched.
- Each user has their own randomized color assigned to them.
- We draw paths instead of squares or circles for smooth paths.
- We added a clear button that applies for all users.