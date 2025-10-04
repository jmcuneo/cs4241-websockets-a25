# ICE 05: Websockets – Real-Time Stock Ticker

In this activity, I implemented a WebSockets-based application that simulates a real-time stock ticker feed. Instead of chat messages, users post stock updates (e.g., "AAPL +2.5%", "TSLA -1.1%"), and the updates are broadcast instantly to all connected clients.

---

### Author
- Aditya Patel

---

### What the Application Does
- The app allows multiple clients to connect via WebSockets.
- Any user can type in a stock update (ticker + % change).
- Positive changes show up in green with 📈, negative changes in red with 📉, and neutral updates remain white with 💹.
- This creates a simple  finance dashboard that feels like a live stock market feed.

---

### How to Run

1. Install dependencies:
   npm install
   npm install express vite-express ws
2. Run the WebSocket server:
   node server.js
3. Run the Vite frontend in a second terminal:
   npm run dev
4. en http://localhost:5173 in two or more browser tabs.
5. Type in stock updates (e.g., "MSFT +1.7%") → they appear on all clients in real time.

---

### Challenges Faced
- Initially installed dependencies in the wrong folder (caused ERR_MODULE_NOT_FOUND errors). Fixed by re-installing inside the correct project directory.
- Debugged WebSocket connections between Vite’s dev server and the Node WebSocket server.
- Adjusted Svelte UI updates to re-render correctly when new stock updates arrived.
- Managing project solo required careful time management.

---

### Notes
- Built using Svelte + WebSockets + Express + ViteExpress.
- Focused on keeping the project simple but unique by making it finance-themed instead of just a chat demo.
- Submitted at home