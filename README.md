# ICE 05: Websockets
Group Members: Timothy Hutzley (Solo)

## Description
This is a real-time number guessing game where a random number between 1-100 is generated and every player connected to the site can begin guessing numbers. The application displays the player's name, along with their guess, and whether the guess was too high, too low, or the correct value. Once the correct value has been guessed, the game will congratulate the winning player and reset the random number to allow players to continue guessing indefinitely.

## How to Use
1. First ensure you are in the "vite-project" directory
2. Install dependencies using: `npm install`
3. Start the server using: `node server.js`
3. In a new terminal, start the client using: `npm run dev`
4. Open http://localhost:5173/ in multiple browser tabs to test guessing different numbers with multiple players
5. Enter a number into the input box, click guess, and hope you got it right!

## Challenges Faced
The only real challenge that I faced when developing this app was getting the game to reset properly when the correct number is guessed. Actually removing the bulleted list of messages and setting a new secret number were easy to implement, however, the logic to actually communicate between the server and frontend was what made this challenging. Instead of sending strings, I decided to instead send a JSON object with the strings and a flag to determine whether or not to reset the game. 

