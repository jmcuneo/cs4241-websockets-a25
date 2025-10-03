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

  function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
  }

  function changeText(text){
    const textLength = text.length;
    const index = getRandomInt(0, textLength);
    const replacement = String.fromCharCode(getRandomInt(97, 122));
    let charArray = text.split('');
    charArray[index] = replacement;
    return charArray.join('')
  }

  const send = function () {
    let text = document.querySelector("input").value;
    const txt = changeText(text)
    console.log(text);
    console.log(txt)
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
