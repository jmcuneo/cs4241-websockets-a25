let ws;
let isConnected = false;

const statusDiv = document.getElementById('status');
const clientInfoDiv = document.getElementById('clientInfo');
const totalClientsSpan = document.getElementById('totalClients');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);

    ws.onopen = function() {
        isConnected = true;
        updateStatus('Connected', 'connected');
        messageInput.disabled = false;
        sendButton.disabled = false;
        addMessage('Connected to WebSocket server', 'system');
    };

    ws.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            handleMessage(data);
        } catch (error) {
            console.error('Error parsing message:', error);
            addMessage('Error: Invalid message format', 'system');
        }
    };

    ws.onclose = function() {
        isConnected = false;
        updateStatus('Disconnected', 'disconnected');
        messageInput.disabled = true;
        sendButton.disabled = true;
        clientInfoDiv.style.display = 'none';
        addMessage('Disconnected from server', 'system');
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
        addMessage('WebSocket error occurred', 'system');
    };
}

function handleMessage(data) {
    switch (data.type) {
        case 'welcome':
            totalClientsSpan.textContent = data.totalClients;
            clientInfoDiv.style.display = 'block';
            addMessage(data.message, 'system');
            break;
        case 'message':
            addMessage(data.message, 'user');
            totalClientsSpan.textContent = data.totalClients;
            break;
        case 'user_joined':
            addMessage(data.message, 'system');
            totalClientsSpan.textContent = data.totalClients;
            break;
        case 'user_left':
            addMessage(data.message, 'system');
            totalClientsSpan.textContent = data.totalClients;
            break;
        case 'error':
            addMessage(`Error: ${data.message}`, 'system');
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function updateStatus(text, className) {
    statusDiv.textContent = text;
    statusDiv.className = `status ${className}`;
}

function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message && isConnected) {
        ws.send(JSON.stringify({
            text: message
        }));
        messageInput.value = '';
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Connect when page loads
connect();
