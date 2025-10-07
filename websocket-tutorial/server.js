import express from "express";
import http from "http";
import ViteExpress from "vite-express";
import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";

const app = express();
const server = http.createServer(app);
const socketServer = new WebSocketServer({ server });

const clients = new Map();
const messages = [];

function broadcast(obj, excludeId = null) {
    const data = JSON.stringify(obj);
    for (const [id, client] of clients.entries()) {
        if (id === excludeId) continue;
        if (client.ws.readyState === client.ws.OPEN) {
            client.ws.send(data);
        }
    }
}

socketServer.on("connection", (ws) => {
    const clientId = randomUUID();
    console.log("new ws connection:", clientId);

    clients.set(clientId, { id: clientId, ws, name: null });

    ws.send(
        JSON.stringify({
            type: "history",
            messages,
        })
    );

    ws.on("message", (raw) => {
        try {
            const data = JSON.parse(raw.toString());

            switch (data.type) {
                case "join": {
                    const name = data.name || "Anonymous";
                    clients.get(clientId).name = name;
                    console.log(`${name} joined (${clientId})`);

                    broadcast(
                        {
                            type: "presence",
                            action: "join",
                            id: clientId,
                            name,
                        },
                        null
                    );
                    break;
                }

                case "send_message": {
                    const client = clients.get(clientId);
                    const sender = client && client.name ? client.name : "Unknown";
                    const id = randomUUID();
                    const ts = Date.now();
                    const msg = { id, sender, text: data.text, ts, readBy: [sender] };
                    messages.push(msg);

                    broadcast({ type: "message", message: msg });

                    break;
                }

                case "read": {
                    const client = clients.get(clientId);
                    if (!client) break;
                    const reader = client.name || "Unknown";
                    const messageId = data.messageId;
                    const msg = messages.find((m) => m.id === messageId);
                    if (!msg) break;

                    if (!msg.readBy.includes(reader)) {
                        msg.readBy.push(reader);

                        broadcast({
                            type: "read",
                            messageId,
                            reader,
                        }, null);
                    }
                    break;
                }

                default:
                    console.warn("unknown message type:", data.type);
            }
        } catch (err) {
            console.error("invalid ws message", err);
        }
    });

    ws.on("close", () => {
        const client = clients.get(clientId);
        const name = client && client.name;
        clients.delete(clientId);
        console.log("disconnect:", clientId, name);
        if (name) {
            broadcast({
                type: "presence",
                action: "leave",
                id: clientId,
                name,
            }, null);
        }
    });

    ws.on("error", (err) => {
        console.error("ws error", err);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`HTTP+WS server listening on :${PORT}`);
});

ViteExpress.bind(app, server);
