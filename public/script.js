

console.log("Loaded script.js.");

const ws = new WebSocket('ws://127.0.0.1:8080');

console.log("Websocket is: ", ws);

ws.onopen = function(e) {
    console.log("Socket opened.", e);
};

ws.onerror = function(e) {
    console.log("Error: ", e);
};

