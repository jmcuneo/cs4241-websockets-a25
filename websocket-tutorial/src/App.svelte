<script>
  import { onMount } from "svelte";
  import { tick } from "svelte";

  let ws;
  let connected = false;
  let name = "";
  let nameEntered = false;
  let input = "";
  let msgs = [];
  let toasts = [];

  const wsUrl = "ws://127.0.0.1:3000";

  function addToast(text, timeout = 3500) {
    const id = cryptoRandom();
    toasts = [{ id, text }, ...toasts];
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
    }, timeout);
  }

  function cryptoRandom() {
    return Math.random().toString(36).slice(2, 9);
  }

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      connected = true;
      ws.send(JSON.stringify({ type: "join", name }));
    };

    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);

      switch (data.type) {
        case "history": {
          msgs = data.messages.map((m) => ({
            ...m,
            localRead: m.readBy.includes(name),
          }));
          break;
        }

        case "presence": {
          if (data.action === "join") {
            addToast(`${data.name} joined`);
          } else if (data.action === "leave") {
            addToast(`${data.name} left`);
          }
          break;
        }

        case "message": {
          const m = data.message;
          if (!msgs.find((x) => x.id === m.id)) {
            const localRead = m.readBy.includes(name) || m.sender === name;
            msgs = [
              ...msgs,
              {
                ...m,
                localRead,
              },
            ];
            if (m.sender !== name) {
              addToast(`New message from ${m.sender}`);
            }
          }
          break;
        }

        case "read": {
          const { messageId, reader } = data;
          msgs = msgs.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  readBy: Array.from(new Set([...(m.readBy || []), reader])),
                }
              : m,
          );
          break;
        }

        default:
          console.warn("unknown ws type", data);
      }
    };

    ws.onclose = () => {
      connected = false;
      addToast("Disconnected from server");
    };

    ws.onerror = (e) => {
      console.error("ws error", e);
      addToast("WebSocket error (see console)");
    };
  }

  function submitName() {
    if (!name.trim()) return;
    nameEntered = true;
    connect();
  }

  function sendMessage() {
    const txt = input.trim();
    if (!txt || !connected) return;
    const payload = { type: "send_message", text: txt };
    ws.send(JSON.stringify(payload));

    input = "";
  }

  function isUnreadByMe(m) {
    return (
      m.sender !== name &&
      (!m.readBy || !m.readBy.includes(name)) &&
      !m.localRead
    );
  }

  function revealMessage(m) {
    if (!isUnreadByMe(m)) return;

    m.localRead = true;
    m.readBy = Array.from(new Set([...(m.readBy || []), name]));
    if (connected) {
      ws.send(JSON.stringify({ type: "read", messageId: m.id }));
    }
  }

  function fmtTs(ts) {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString();
    } catch {
      return "";
    }
  }
</script>

<div class="app">
  {#if !nameEntered}
    <div class="name-entry">
      <input
        placeholder="Enter your name"
        bind:value={name}
        on:keydown={(e) => {
          if (e.key === "Enter") submitName();
        }}
      />
      <button on:click={submitName} disabled={!name.trim()}>Join Chat</button>
    </div>
  {:else}
    <header>
      <div>Logged in as <strong>{name}</strong></div>
      <div>{connected ? "Connected" : "Connecting..."}</div>
    </header>

    <div class="messages" id="scrollArea">
      {#each msgs as m (m.id)}
        <div
          class="msg {m.sender === name ? 'me' : 'them'}"
          style="margin-left: {m.sender === name
            ? 'auto'
            : '0'}; max-width:72%;"
        >
          <div style="font-weight:600; margin-bottom:6px;">
            {m.sender}
            <span style="font-weight:400; color:#666; font-size:12px"
              >· {fmtTs(m.ts)}</span
            >
          </div>

          <div style="position:relative;">
            <div class={isUnreadByMe(m) ? "blurred" : ""}>
              {m.text}
            </div>

            {#if isUnreadByMe(m)}
              <div class="overlay">
                <button on:click={() => revealMessage(m)}>
                  Click to reveal & mark read
                </button>
              </div>
            {/if}
          </div>

          <div class="meta">
            {#if m.readBy && m.readBy.length}
              Read by:
              {#each m.readBy as r, idx}
                <span class="readby"
                  >{r}{idx < m.readBy.length - 1 ? ", " : ""}</span
                >
              {/each}
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="send">
      <input
        style="flex:1"
        placeholder="Type a message and press Enter"
        bind:value={input}
        on:keydown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button on:click={sendMessage}>Send</button>
    </div>
  {/if}
</div>

<div class="toasts">
  {#each toasts as t (t.id)}
    <div class="toast">{t.text}</div>
  {/each}
</div>

<style>
  :global(body) {
    font-family:
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      "Helvetica Neue",
      Arial;
    margin: 0;
    padding: 0;
    background: #f7f8fb;
  }

  .app {
    max-width: 760px;
    margin: 24px auto;
    background: white;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 6px 18px rgba(20, 20, 40, 0.06);
  }

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .messages {
    min-height: 320px;
    max-height: 520px;
    overflow: auto;
    padding: 8px;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #fcfdff;
  }

  .msg {
    padding: 10px;
    margin-bottom: 8px;
    border-radius: 8px;
    position: relative;
    color: black;
  }

  .me {
    background: #eaf8ff;
    align-self: flex-end;
  }

  .them {
    background: #fff;
    border: 1px solid #f0f2f5;
  }

  .blurred {
    filter: blur(6px);
    user-select: none;
    pointer-events: none;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .overlay button {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
  }

  .meta {
    font-size: 12px;
    color: #666;
    margin-top: 6px;
  }

  .toasts {
    position: fixed;
    right: 16px;
    top: 16px;
    z-index: 50;
  }

  .toast {
    background: #222;
    color: white;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    opacity: 0.95;
    font-size: 14px;
  }

  .send {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .name-entry {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .readby {
    font-size: 12px;
    color: #0b6;
  }
</style>
