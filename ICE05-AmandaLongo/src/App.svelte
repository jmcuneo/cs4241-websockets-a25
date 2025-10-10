<script>
  let msgs = []
  let inputText = ''
  let nickname = ''
  let isNicknameSet = false
  let onlineUsers = []
  let typingUsers = []
  let isTyping = false
  let typingTimeout = null
  let userId = Math.random().toString(36).substr(2, 9)
  let messageIdCounter = 0

  // Generate unique message IDs
  function generateMessageId() {
    return `msg_${Date.now()}_${messageIdCounter++}_${Math.random().toString(36).substr(2, 5)}`
  }

  const ws = new WebSocket('ws://127.0.0.1:8080')

  ws.onopen = () => {
    console.log('Connected to chat server!')
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason)
  }

  ws.onmessage = (event) => {
    console.log('Raw message received:', event.data)
    try {
      const data = JSON.parse(event.data)
      console.log('Parsed message:', data)
      
      switch(data.type) {
        case 'message':
          msgs = [...msgs, {
            id: generateMessageId(),
            type: 'message',
            user: data.user,
            text: data.text,
            timestamp: data.timestamp,
            userId: data.userId
          }]
          playNotificationSound()
          scrollToBottom()
          break
          
        case 'userJoined':
          msgs = [...msgs, {
            id: generateMessageId(),
            type: 'system',
            text: `${data.user} joined the chat`,
            timestamp: data.timestamp
          }]
          updateOnlineUsers(data.users)
          break
          
        case 'userLeft':
          msgs = [...msgs, {
            id: generateMessageId(),
            type: 'system',
            text: `${data.user} left the chat`,
            timestamp: data.timestamp
          }]
          updateOnlineUsers(data.users)
          break
          
        case 'typing':
          updateTypingUsers(data.user, data.isTyping)
          break
          
        case 'userList':
          updateOnlineUsers(data.users)
          break
      }
    } catch (e) {
      console.error('JSON parsing error:', e)
      console.log('Failed to parse message:', event.data)
      // Handle plain text messages (backward compatibility)
      msgs = [...msgs, {
        id: generateMessageId(),
        type: 'message',
        user: 'Unknown',
        text: event.data,
        timestamp: new Date().toISOString()
      }]
    }
  }

  function updateOnlineUsers(users) {
    onlineUsers = users || []
  }

  function updateTypingUsers(user, typing) {
    if (typing) {
      if (!typingUsers.includes(user)) {
        typingUsers = [...typingUsers, user]
      }
    } else {
      typingUsers = typingUsers.filter(u => u !== user)
    }
  }

  function setNickname() {
    if (nickname.trim()) {
      isNicknameSet = true
      ws.send(JSON.stringify({
        type: 'join',
        user: nickname,
        userId: userId
      }))
    }
  }

  function send() {
    console.log('Send function called')
    console.log('inputText:', inputText)
    console.log('isNicknameSet:', isNicknameSet)
    console.log('WebSocket readyState:', ws.readyState)
    
    if (inputText.trim() === '' || !isNicknameSet) {
      console.log('Send blocked: empty text or nickname not set')
      return
    }
    
    const message = {
      type: 'message',
      user: nickname,
      text: inputText,
      userId: userId,
      timestamp: new Date().toISOString()
    }
    
    console.log('Sending message:', message)
    ws.send(JSON.stringify(message))
    
    inputText = ''
    stopTyping()
  }

  function handleTyping() {
    if (!isTyping && isNicknameSet) {
      isTyping = true
      ws.send(JSON.stringify({
        type: 'typing',
        user: nickname,
        isTyping: true
      }))
    }
    
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      stopTyping()
    }, 1000)
  }

  function stopTyping() {
    if (isTyping) {
      isTyping = false
      ws.send(JSON.stringify({
        type: 'typing',
        user: nickname,
        isTyping: false
      }))
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      if (isNicknameSet) {
        send()
      } else {
        setNickname()
      }
    } else if (isNicknameSet) {
      handleTyping()
    }
  }

  function playNotificationSound() {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Silently ignore audio errors - not critical for chat functionality
      console.log('Audio notification not available')
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }

  function getAvatarColor(userId) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    let hash = 0
    for (let i = 0; i < (userId || '').length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }
</script>

{#if !isNicknameSet}
  <div class="nickname-setup">
    <div class="nickname-card">
      <h2>Join the Chat</h2>
      <p>Choose a nickname to get started</p>
      <input 
        bind:value={nickname} 
        placeholder="Enter your nickname..." 
        on:keypress={handleKeyPress}
        maxlength="20"
        class="nickname-input"
      />
      <button on:click={setNickname} disabled={!nickname.trim()} class="join-btn">
        Join Chat
      </button>
    </div>
  </div>
{:else}
  <div class="chat-container">
    <header class="chat-header">
      <h1>Textopia</h1>
      <div class="user-info">
        <span class="current-user">
          <div class="avatar" style="background: {getAvatarColor(userId)}">
            {nickname.charAt(0).toUpperCase()}
          </div>
          {nickname}
        </span>
      </div>
    </header>

    <div class="chat-main">
      <aside class="sidebar">
        <h3>Online Users ({onlineUsers.length})</h3>
        <div class="user-list">
          {#each onlineUsers as user}
            <div class="user-item" class:current={user.userId === userId}>
              <div class="avatar" style="background: {getAvatarColor(user.userId)}">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span>{user.name}</span>
              {#if user.userId === userId}
                <span class="you-label">(you)</span>
              {/if}
            </div>
          {/each}
        </div>
      </aside>

      <div class="chat-content">
        <div class="chat-messages">
          {#each msgs as msg (msg.id)}
            <div class="message {msg.type}" class:own={msg.userId === userId}>
              {#if msg.type === 'message'}
                <div class="avatar" style="background: {getAvatarColor(msg.userId)}">
                  {msg.user.charAt(0).toUpperCase()}
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="username">{msg.user}</span>
                    <span class="timestamp">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div class="message-text">{msg.text}</div>
                </div>
              {:else if msg.type === 'system'}
                <div class="system-message">
                  <span class="system-text">{msg.text}</span>
                  <span class="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
              {/if}
            </div>
          {/each}
          
          {#if typingUsers.length > 0}
            <div class="typing-indicator">
              <div class="typing-content">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="typing-text">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </div>
          {/if}
        </div>

        <div class="chat-input">
          <input 
            bind:value={inputText} 
            placeholder="Type your message...(Press Enter to send)" 
            on:keypress={handleKeyPress}
            class="message-input"
            maxlength="500"
          />
          <button on:click={send} disabled={!inputText.trim()} class="send-btn">
            <span>send</span>
            <span class="send-icon"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  * {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #7FC6A4 0%, #D6F8D6 100%);
    height: 100vh;
  }

  .nickname-setup {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
  }

  .nickname-card {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .nickname-card h2 {
    margin: 0 0 0.5rem;
    color: #1E352F;
  }

  .nickname-card p {
    margin: 0 0 1.5rem;
    color: #1E352F;
  }

  .nickname-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #1E352F;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 1rem;
    transition: border-color 0.3s;
  }

  .nickname-input:focus {
    outline: none;
    border-color: #;
  }

  .join-btn {
    width: 100%;
    padding: 12px;
    background: #7FC6A4;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .join-btn:hover:not(:disabled) {
    background: #1E352F;
  }

  .join-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .chat-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .chat-header {
    background: linear-gradient(135deg, #7FC6A4 0%, #1E352F 100%);
    color: white;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .chat-header h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .current-user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 14px;
  }

  .chat-main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .sidebar {
    width: 250px;
    background: #f8f9fa;
    border-right: 1px solid #e1e5e9;
    padding: 1rem;
    overflow-y: auto;
  }

  .sidebar h3 {
    margin: 0 0 1rem;
    color: #333;
    font-size: 1rem;
  }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .user-item:hover {
    background: #e9ecef;
  }

  .user-item.current {
    background: #D6F8D6;
  }

  .you-label {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  .chat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .chat-messages {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .message.own {
    flex-direction: row-reverse;
  }

  .message.own .message-content {
    text-align: right;
  }

  .message.own .message-text {
    background: #D6F8D6;
    color: white;
  }

  .message-content {
    flex: 1;
    max-width: 70%;
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .message.own .message-header {
    justify-content: flex-end;
  }

  .username {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  .timestamp {
    font-size: 12px;
    color: #666;
  }

  .message-text {
    background: #f1f3f4;
    padding: 0.75rem 1rem;
    border-radius: 18px;
    word-wrap: break-word;
    line-height: 1.4;
  }

  .system-message {
    text-align: center;
    margin: 0.5rem 0;
  }

  .system-text {
    background: #1E352F;
    color: #D6F8D6;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 14px;
    margin-right: 0.5rem;
  }

  .typing-indicator {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    opacity: 0.7;
  }

  .typing-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .typing-dots {
    display: flex;
    gap: 2px;
    padding: 0.5rem;
    background: #f1f3f4;
    border-radius: 18px;
  }

  .typing-dots span {
    width: 6px;
    height: 6px;
    background: #666;
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }

  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }

  .typing-text {
    font-size: 14px;
    color: #666;
    font-style: italic;
  }

  .chat-input {
    display: flex;
    padding: 1rem;
    background: #f8f9fa;
    border-top: 1px solid #e1e5e9;
    gap: 0.75rem;
  }

  .message-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 24px;
    font-size: 16px;
    transition: border-color 0.3s;
  }

  .message-input:focus {
    outline: none;
    border-color: #D6F8D6;
  }

  .send-btn {
    padding: 12px 20px;
    background: #D6F8D6;
    color: white;
    border: none;
    border-radius: 24px;
    cursor: pointer;
    transition: background 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 16px;
  }

  .send-btn:hover:not(:disabled) {
    background: #5a6fd8;
  }

  .send-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .send-icon {
    font-size: 16px;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }
    
    .message-content {
      max-width: 85%;
    }
  }
</style>
