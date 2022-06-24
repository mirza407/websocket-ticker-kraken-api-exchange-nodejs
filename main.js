// Importing the required modules
const WebSocketServer = require('ws');
const WebSocket = require('ws');
const {Kraken} = require('node-kraken-api');
const signalR = require('signalr-client');
const zlib = require('zlib');
const crypto = require('crypto');
const uuid = require('uuid');
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })
 
// Creating connection using websocket
var i = 1;
var kra = null
var bitr = null
var bits = null
wss.on("connection", ws => {
   // sending message
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
	  
    });

    	//=====> Kraken
		const API_KEY = 'MlWItZtB4hqE2c2I9lg3DfnlYFvLQ9CR19Nmd373UEsJtpdAHQlk4NC3';
		const PRIV_KEY = 'NZxR7Qyy7vf59fiomB0j1VFVL4J4BAVpKrHmf4hUUQefVFzhlw6as9CScA24cNNsmjb14nl65ZRyy13zlkWxzA';

        const kraken = new Kraken(API_KEY, PRIV_KEY);

        const ticker =  kraken.ws.ticker()
        .on("update", (update, pair) => { kra = update; ws.send(JSON.stringify({kraken: kra, bittrex: bitr, bitsmap: bits}))})
        .subscribe("XBT/USD");

        //=====> Bittrex
        const url = 'wss://socket-v3.bittrex.com/signalr';
        const hub = ['c3'];

        const apikey = 'd26dcd75c6f14f37bebb5240a88b8279';
        const apisecret = '19c2512c177f4a3cb3ee87c00b71dfaa';

        var client;
        var resolveInvocationPromise = () => { };

        async function main() {
        client = await connect();
        if (apisecret) {
            await authenticate(client);
        }
        else {
            console.log('Authentication skipped because API key was not provided')
        }
        await subscribe(client);
        }

        async function connect() {
        return new Promise((resolve) => {
            const client = new signalR.client(url, hub);
            client.serviceHandlers.messageReceived = messageReceived;
            client.serviceHandlers.connected = () => {
            console.log('Connected');
            return resolve(client)
            }
        });
        }

        async function authenticate(client) {
        const timestamp = new Date().getTime()
        const randomContent = uuid.v4()
        const content = `${timestamp}${randomContent}`
        const signedContent = crypto.createHmac('sha512', apisecret)
            .update(content).digest('hex').toUpperCase()

        const response = await invoke(client, 'authenticate',
            apikey,
            timestamp,
            randomContent,
            signedContent);

        if (response['Success']) {
            console.log('Authenticated');
        }
        else {
            console.log('Authentication failed: ' + response['ErrorCode']);
        }
        }

        async function subscribe(client) {
        const channels = [
            'ticker_BTC-USDC'
        ];
        const response = await invoke(client, 'subscribe', channels);

        for (var i = 0; i < channels.length; i++) {
            if (response[i]['Success']) {
            console.log('Subscription to "' + channels[i] + '" successful');
            }
            else {
            console.log('Subscription to "' + channels[i] + '" failed: ' + response[i]['ErrorCode']);
            }
        }
        }

        async function invoke(client, method, ...args) {
        return new Promise((resolve, reject) => {
            resolveInvocationPromise = resolve; // Promise will be resolved when response message received

            client.call(hub[0], method, ...args)
            .done(function (err) {
                if (err) { return reject(err); }
            });
        });
        }

        function messageReceived(message) {
        const data = JSON.parse(message.utf8Data);
        if (data['R']) {
            resolveInvocationPromise(data.R);
        }
        else if (data['M']) {
            data.M.forEach(function (m) {
            if (m['A']) {
                if (m.A[0]) {
                const b64 = m.A[0];
                const raw = new Buffer.from(b64, 'base64');

                zlib.inflateRaw(raw, function (err, inflated) {
                    if (!err) {
                    const json = JSON.parse(inflated.toString('utf8'));
                    // console.log(m.M + ': ');
                    // console.log(json);
                    bitr = json;
                    ws.send(JSON.stringify({kraken: kra, bittrex: bitr, bitsmap: bits}))
                    }
                });
                }
                else if (m.M == 'heartbeat') {
                console.log('\u2661');
                }
                else if (m.M == 'authenticationExpiring') {
                console.log('Authentication expiring...');
                authenticate(client);
                }
            }
            });
        }
        }
        main();

        //=====> Bittrex

    var subscribeMsg = {
        "event": "bts:subscribe",
        "data": {
            "channel": "live_trades_btcusd"
        }
    };
        
    function initWebsocket() {
        const wsss =new WebSocket("wss://ws.bitstamp.net");

        wsss.onopen = function () {
            wsss.send(JSON.stringify(subscribeMsg));
        };

        function serializeTrade(data) {
            bits = data;
            ws.send(JSON.stringify({kraken: kra, bittrex: bitr, bitsmap: bits}))
            // if (i === 0) {
            //     placeholder.innerHTML = '';
            // }
            // child = document.createElement('div');
            // child.innerHTML = '(' + data.timestamp + ') ' + data.id + ': ' + data.amount + ' BTC @ ' + data.price + ' USD ' + data.type;
            // placeholder.appendChild(child);
            // i++;
        }

        wsss.onmessage = function (evt) {
            response = JSON.parse(evt.data);
            /**
             * This switch statement handles message logic. It processes data in case of trade event
             * and it reconnects if the server requires.
             */
            switch (response.event) {
                case 'trade': {
                    serializeTrade(response.data);
                    break;
                }
                case 'bts:request_reconnect': {
                    initWebsocket();
                    break;
                }
            }

        };
    }

    initWebsocket();

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
