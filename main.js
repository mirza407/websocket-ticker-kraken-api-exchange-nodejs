// Importing the required modules
const WebSocketServer = require('ws');
const Kraken = require('kraken-exchange');
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })
 
// Creating connection using websocket
var i = 1;
wss.on("connection", ws => {
   // sending message
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
	  
		//=====> THIRD WAY
		const API_KEY = 'MlWItZtB4hqE2c2I9lg3DfnlYFvLQ9CR19Nmd373UEsJtpdAHQlk4NC3';
		const PRIV_KEY = 'NZxR7Qyy7vf59fiomB0j1VFVL4J4BAVpKrHmf4hUUQefVFzhlw6as9CScA24cNNsmjb14nl65ZRyy13zlkWxzA';
		const kraken = new Kraken(API_KEY, PRIV_KEY);

		kraken.ticker(['XBTUSD','BTCUSD'])
		.then(
			response => ws.send(JSON.stringify(response))
		);
	});
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has connected");
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 8080");