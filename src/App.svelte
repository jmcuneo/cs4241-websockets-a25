<script>
  let msgs = [];

  const ws = new WebSocket("ws://127.0.0.1:3000");

  // when connection is established...
  ws.onopen = () => {
    ws.send("a new client has connected.");

    //get random color
    const colors = ["red", "blue", "green", "orange", "purple"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = color;

    let name = setName();

    ws.onmessage = async (msg) => {
      // add message to end of msgs array,
      // re-assign to trigger UI update
      const message = await msg.data.text();
      msgs = msgs.concat([name + ": " + message]);
    };
  };

  const send = function () {
    const txt = document.querySelector("input").value;
    ws.send(txt);
    msgs = msgs.concat(["Me: " + txt]);
  };

  //add name
  let setName = function () {
    //ask for name with promt
    let name = prompt("Enter your name:");
    ws.send(name + " has joined the chat.");
    return name;
  };
</script>

<input type="text" on:change={send} />

{#each msgs as msg}
  <h3>{msg}</h3>
{/each}
