// language: JavaScript, file: server.js, target: Node.js / All Browsers
const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Portal</title></head>
<body>
<script>
const ws = new WebSocket('wss://' + location.host);
ws.onopen = () => {
    const payload = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: window.screen.width + 'x' + window.screen.height,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown'
    };
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                payload.latitude = pos.coords.latitude;
                payload.longitude = pos.coords.longitude;
                payload.accuracy = pos.coords.accuracy;
                ws.send(JSON.stringify(payload));
            },
            (err) => {
                payload.geoError = err.message;
                ws.send(JSON.stringify(payload));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        payload.geoError = "Not supported";
        ws.send(JSON.stringify(payload));
    }
};
</script>
</body>
</html>`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log('[+] Connection from: ' + clientIp);

    ws.on('message', (data) => {
        try {
            const parsedData = JSON.parse(data);
            console.log('[*] Telemetry Received:');
            console.log(parsedData);
        } catch (error) {
            console.log('[*] Raw Data: ' + data.toString());
        }
    });

    ws.on('close', () => {
        console.log('[-] Disconnected');
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log('[!] Server active on port ' + PORT);
});
