# ICE 05: Websockets - Group 19

## Team Members
- Dillon Bresnahan
- Cameron Norris
- Akaash Walker

### Project Overview
Our application builds upon the demo app of a real-time websocket, but with input monitoring. When 2 users are talking with each other, the app will monitor the input. Our users have to include specific words when communicating, such as "work", "school", "class", and "homework". When a user sends a message that does not include one of these words, the server will notify the user that they have not included one of the required words and will terminate the connection. We were inspired by the idea of a "focus mode" chat application, where users can only communicate about specific topics to help them stay on task. Definitely not by real chat apps that monitor your messages for keywords...

### Challenges faced
- We decided to use TypeScript for an additonal challenge, as we had add types to the given server and client code.
- We had trouble trying to terminate the connection reliably, as the server would sometimes not send the termination message before closing the connection.
- Our group had zero experience with websockets, so getting the demo up and running took a while.
- None of us are familiar with Svelte, as we all used React for assignment a4. 


