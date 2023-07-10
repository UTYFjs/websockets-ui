import WebSocket, { WebSocketServer } from "ws";
import { ResponseType, WsResponse } from "../types/types";
import { validation } from "../utils/validation";
import { addShips, addUsersToRoom, createGame, createRoom, gameDb, roomDb, userDb, winnersDb } from "../db/db";
import { responseAll } from "../response/responseAll";
import { responsePersonal } from "../response/responsePersonal";
import { responseToGameRoom } from "../response/responseToGameRoom";
import { typesResponseToGameRoom } from "../const/constants";
import { getRandomAttackData } from "./handle";


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
							responseToGameRoom(typesResponseToGameRoom.create_game, currentIdGame);
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
					// eslint-disable-next-line no-case-declarations
					const currentGame = gameDb.find((game) => game.idGame === data.gameId);
					if (currentGame) {
						if (data.indexPlayer === currentGame.currentPlayer && typeof currentGame.currentPlayer === "number") {
							if (
								currentGame[currentGame.currentPlayer].logShots.findIndex(
									(item) => item.x === data.x && item.y === data.y,
								) === -1
							) {
								console.log("заходит в обработку атаки");
								currentGame[currentGame.currentPlayer].logShots.push({ x: data.x, y: data.y });
								console.log(currentGame[currentGame.currentPlayer].logShots);
								responseToGameRoom(typesResponseToGameRoom.attack, data.gameId, data);
								responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
							} else {
								const dataResponse = { currentPlayer: currentGame.currentPlayer };
								const response = { type: typesResponseToGameRoom.turn, data: JSON.stringify(dataResponse), id: 0 };
								currentGame.currentRoom.roomUsers[currentGame.currentPlayer].userId.send(JSON.stringify(response));
							}
						}
					}
					return;
				case "randomAttack":
					// eslint-disable-next-line no-case-declarations
					const randomCoordinates = getRandomAttackData(data.gameId);
					// eslint-disable-next-line no-case-declarations
					const dataForRandomAttack = {
						gameId: data.gameId,
						x: randomCoordinates.x,
						y: randomCoordinates.y,
						indexPlayer: data.indexPlayer,
					};
					
					responseToGameRoom(typesResponseToGameRoom.attack, data.gameId, dataForRandomAttack);
					responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
					return;
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
	ws.on("close", () => {

		const room = roomDb.find(room => room.roomUsers.find((user) => {
			console.log("user.userId", user.userId);
			return user.userId === ws;}));
		console.log("room", room);
		if(room) {
			console.log(" Room Client disconnected");
			const i = room.roomUsers.find((user) => user.userId === ws);
			const enemy = room.roomUsers.find((user) => user.userId !== ws);
			// add winners to winnerTable
			if (enemy) {
				console.log("Enemy Client disconnected");
				const winnerIndexPlayer = room.roomUsers.findIndex((user) => user.userId = enemy.userId);
				//add to winner table
				const enemyName = enemy.name;
				const winner = winnersDb.find((winner) => winner.name === enemyName);
				if (winner) {
					winner.wins += 1;
				} else {
					winnersDb.push({
						name: enemyName,
						wins: 1,
					});
				}
				//send finish to enemy
				const currentGame = gameDb.find((game )=> game.currentRoom.roomId === room.roomId);
				
				const response = { type: typesResponseToGameRoom.finish, data: JSON.stringify({ winPlayer: winnerIndexPlayer }), id: 0 };
				enemy.userId.send(JSON.stringify(response));
				i?.userId.send(JSON.stringify(response));
			}
			// send all update winners
			const responseAll = { type: "update_winners", data: JSON.stringify(winnersDb), id: 0 };
			wss.clients.forEach((client) => {
				client.send(JSON.stringify(responseAll));
			});

			const roomId = room.roomId;
		}

		console.log("Client disconnected");
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
