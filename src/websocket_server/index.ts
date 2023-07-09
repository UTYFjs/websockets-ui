import WebSocket, { WebSocketServer } from "ws";
import { ResponseType, WsResponse } from "../types/types";
import { validation } from "../utils/validation";
import { addShips, addUsersToRoom, createGame, createRoom, gameDb, roomDb, userDb } from "../db/db";
import { responseAll } from "../response/responseAll";
import { responsePersonal } from "../response/responsePersonal";
import { responseToGameRoom } from "../response/responseToGameRoom";
import { typesResponseToGameRoom } from "../const/constants";


export const wss = new WebSocketServer({port: 3000});

wss.on("connection", function connection(ws) {
	console.log("there are connection websocket");
	//ws = Date.now(); можно при создании комнаты каждой комнате передавать айдикомнаты и делать комнаты приватными
	// ws - одно подключение
	ws.on("error", console.error);
	ws.on("message", function message(message) {
		//console.log("received: %s", message);
		const message1 = JSON.parse(message.toString());
		
		const handle = (
			message: WsResponse,
			ws: WebSocket,
			wss: WebSocket.Server,
		) => {
			const data = validation(message);
			if(data){

				let response: ResponseType;
				let dataResponse;
				let dataRes;
				let dataRes1;
				switch (message.type) {
				case "reg":
					dataRes = JSON.parse(message.data);

					userDb.push({ userId: ws, name: data.name, password: data.password });
					responsePersonal(ws);
					responseAll("update_winners");
					return;

				case "create_room":
					// eslint-disable-next-line no-case-declarations
					const currentUser = userDb.find((user) => user.userId === ws);
					if (currentUser) {
						createRoom({ userId: ws, name: currentUser.name });
						responseAll("update_room");
					}
					return;
				case "add_user_to_room":
					// eslint-disable-next-line no-case-declarations
					const currentRoom = roomDb.find((room) => room.roomId === data.indexRoom);
					// eslint-disable-next-line no-case-declarations
					let firstPlayer;
					// eslint-disable-next-line no-case-declarations
					const secondPlayer = userDb.find((user) => user.userId === ws);
					if (currentRoom && secondPlayer) {
						firstPlayer = currentRoom.roomUsers.find((user) => user.index === 0);
						addUsersToRoom(data.indexRoom, ws, secondPlayer.name);
						if (firstPlayer) {
							const currentIdGame = createGame(currentRoom);
							responseToGameRoom(typesResponseToGameRoom.create_game, currentIdGame, currentRoom);
							//responseToGameRoom()
						}
						responseAll("update_room");
					} else {
						ws.send("some error, no currentRoom or secondPlayer");
					}

					return;
				case "add_ships":
					addShips(data);
					responseToGameRoom(typesResponseToGameRoom.start_game, data.gameId);
					responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
					return;
				case "attack":
					console.log("attack.data --->", message.data);
					// eslint-disable-next-line no-case-declarations
					const currentGame = gameDb.find(game => game.idGame === data.gameId);
					if(currentGame){
						if(data.indexPlayer === currentGame?.currentPlayer){
							responseToGameRoom(typesResponseToGameRoom.attack, data.gameId);
							responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
						}
					}

					dataRes = JSON.parse(message.data);
					dataRes1 = JSON.stringify({ position: { x: 1, y: 1 }, currentPlayer: 1, status: "missed | killed | shot" });
					return { type: "start_game", data: dataRes1, id: 0 };
				}
			}else{
				wss.clients.forEach((client)=>{client.send("error");});
			}

		};
		const req = handle(message1 as unknown as WsResponse, ws, wss );
		/*wss.clients.forEach((client) => {
			client.send(JSON.stringify(req));
		});*/
		//ws.send(JSON.stringify(req));
	});
	//wss.clients Arr - все клиенты у кого установлено подключение 
	/*wss.clients.forEach((client) => { // каждый элемент в массиве  - клиент
		client.send();
если клиент обладает айдишником ему можно отправить сообщение
if(client.id === id) { client.send()}

	});*/
	const forSend = { hello: "hello,, websocket is connected" };
	console.log(JSON.stringify(forSend));
});
