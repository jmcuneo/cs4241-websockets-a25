<script lang="ts">

  let msgs: string[] = []

  let allowedPhrases: string[] = [
    "Homework",
    "School",
    "Class",
    "Work",
  ]
      
  const ws = new WebSocket( 'ws://127.0.0.1:3000' )

  // when connection is established...
  ws.onopen = () => {
    ws.send( 'a new client has connected.' )

    ws.onmessage = async msg => {
      // add message to end of msgs array,
      // re-assign to trigger UI update
      const message: string = await msg.data.text()
      msgs = msgs.concat([ 'them: ' + message ])
      
    }
  }

  const send = function() {
    if (document === null){
      return;
    }
    else{
      //const txt: string|null = document.querySelector('input').value
      const temp: HTMLInputElement|null = document.querySelector('input')!
      const txt: string = temp.value;

      if (isAllowed(txt)){
        ws.send( txt )
        msgs = msgs.concat([ 'me: ' + txt ])
      }
      else{
        alert("Nope. You can't do that. Time to delete System 32");
        const close = fetch('/close', {
          method: "POST"
        })
      }
    }
    
  }


  const isAllowed = function(phrase: string){
    phrase = phrase.toLowerCase();

    for (let i = 0; i < allowedPhrases.length; i++){
      let currWord: string = allowedPhrases[i].toLowerCase();

      if (phrase.includes(currWord))
        return true;
    }

    return false;
  }
</script>
<h1>Welcome to On Topic Texter</h1>
<h3>You can only send messages that include the following phrases: Homework, School, Class, and Work.</h3>
<h3>Any other message will result in server shutdown.</h3>

<input type='text' on:change={send} />

{#each msgs as msg }
  <h3>{msg}</h3>
{/each}