import WebSocket, { WebSocketServer } from "ws";
import { WsResponse } from "./types";

export const wss = new WebSocketServer({
	port: 3000,
	/*perMessageDeflate: {
		zlibDeflateOptions: {
			// See zlib defaults.
			chunkSize: 1024,
			memLevel: 7,
			level: 3,
		},
		zlibInflateOptions: {
			chunkSize: 10 * 1024,
		},
		// Other options settable:
		clientNoContextTakeover: true, // Defaults to negotiated value.
		serverNoContextTakeover: true, // Defaults to negotiated value.
		serverMaxWindowBits: 10, // Defaults to negotiated value.
		// Below options specified as default values.
		concurrencyLimit: 10, // Limits zlib concurrency for perf.
		threshold: 1024, // Size (in bytes) below which messages
		// should not be compressed if context takeover is disabled.
	},*/
});

wss.on("connection", function connection(ws) {
	console.log("there are connection websocket");
	ws.on("error", console.error);
	let req;
	ws.on("message", function message(message) {
		console.log("received: %s", message);
		const message1 = JSON.parse(message.toString());
		const handle = (message: WsResponse) => {
			let dataRes;
			let dataRes1;
			console.log("data from handle", message);
			switch (message.type) {
			case "reg":
				dataRes = JSON.parse(message.data);
				dataRes1 = { name: dataRes.name, index: 1, error: false, errorText: "noError" };
				return { type: "reg", data: JSON.stringify(dataRes1), id: 0 };
			case "create_room":
				dataRes1 =  JSON.stringify( [{  roomId: 1, roomUsers: [ {  name: 12345,index:1,  } ],}, ] );
				return { type: "update_room", data: dataRes1, id: 0 };
			}
		};
		const req = handle(message1 as unknown as WsResponse );
		ws.send(JSON.stringify(req));
	});

	const forSend = { hello: "hello,, websocket is connected" };
	console.log(JSON.stringify(forSend));
});
