/* eslint-disable max-lines-per-function */
import WebSocket from "ws";
import { bot_ships } from "../bot_ships/bot_ships";
import { typesResponseToGameRoom } from "../const/constants";
import { addShips, addUsersToRoom, createGame, createRoom, gameDb, roomDb, userDb } from "../db/db";
import { responseAll } from "../response/responseAll";
import { responsePersonal } from "../response/responsePersonal";
import { responseToGameRoom } from "../response/responseToGameRoom";
import { WsResponse } from "../types/types";
import { validation } from "../utils/validation";


export const handle = async (message: WsResponse, ws: WebSocket, wss: WebSocket.Server) => {
	const data = validation(message);
	if (data) {
		switch (message.type) {
		case "reg":
			// eslint-disable-next-line no-case-declarations
			const currentUser1 = userDb.find((user) => user.name === data.name);
			if (currentUser1) {
				const currentPassword = userDb.find((user) => user.password === data.password);
				if (currentPassword) {
					const indexCurrentUser = userDb.findIndex((user) => user.name === data.name);
					if(indexCurrentUser !== -1){
						userDb[indexCurrentUser].userId = ws;
					}
					responsePersonal(ws);
					responseAll("update_winners");
				} else {
					responsePersonal(ws, true);
				}
			} else {
				userDb.push({ userId: ws, name: data.name, password: data.password });
				responsePersonal(ws);
				responseAll("update_winners");
			}

			return;

		case "create_room":
			// eslint-disable-next-line no-case-declarations
			const currentUser = userDb.find((user) => user.userId === ws);
			// eslint-disable-next-line no-case-declarations
			const roomsThisUser = roomDb.find((room) => room.roomUsers.find((user) => user.userId === ws));
			if (!roomsThisUser) {
				if (currentUser) {
					createRoom({ userId: ws, name: currentUser.name });
					responseAll("update_room");
				}
			}

			return;
		case "add_user_to_room":
			// eslint-disable-next-line no-case-declarations
			const currentRoom = roomDb.find((room) => room.roomId === data.indexRoom);
			// eslint-disable-next-line no-case-declarations
			if (currentRoom) {
				const firstPlayer = currentRoom.roomUsers.find((user) => user.index === 0);
				// eslint-disable-next-line no-case-declarations
				const secondPlayer = userDb.find((user) => user.userId === ws);
				if (secondPlayer && firstPlayer && firstPlayer.userId !== secondPlayer.userId) {
					addUsersToRoom(data.indexRoom, ws, secondPlayer.name);

					const currentIdGame = createGame(currentRoom);
					responseToGameRoom(typesResponseToGameRoom.create_game, currentIdGame);
					//responseToGameRoom()

					responseAll("update_room");
				}
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
				const bot = !currentGame.currentRoom.roomUsers[1].userId;

				if (bot) {
					if (data.indexPlayer === currentGame.currentPlayer && typeof currentGame.currentPlayer === "number") {
						if (
							currentGame[currentGame.currentPlayer].logShots.findIndex(
								(item) => item.x === data.x && item.y === data.y,
							) === -1
						) {
							// log shots
							currentGame[currentGame.currentPlayer].logShots.push({ x: data.x, y: data.y });
							responseToGameRoom(typesResponseToGameRoom.attack, data.gameId, data);
							responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
						} else {
							const dataResponse = { currentPlayer: currentGame.currentPlayer };
							const response = {
								type: typesResponseToGameRoom.turn,
								data: JSON.stringify(dataResponse),
								id: 0,
							};
							const currentPlayerID = currentGame.currentRoom.roomUsers[currentGame.currentPlayer].userId;
							if (currentPlayerID) {
								currentPlayerID.send(JSON.stringify(response));
							}
						}
					}
					//logic for bot
					if (currentGame.currentPlayer === 1) {
						console.log("I'm bot, and I'll win you");

						while (currentGame.currentPlayer === 1) {
							const randomCoordinates = getRandomAttackData(data.gameId);
							const dataForRandomAttack = {
								gameId: data.gameId,
								x: randomCoordinates.x,
								y: randomCoordinates.y,
								indexPlayer: 1,
							};
							/// иногда после задержки стреляет на моем поле.... 
							// Оборачиваем setTimeout в промис
							const botAttack = async () => {
								return new Promise((resolve) => {
									setTimeout(() => {
										console.log("атака бота");
										resolve(undefined);
									}, 2000);
								});
							};

							// Используем async/await для ожидания задержки
							await botAttack();

							responseToGameRoom(typesResponseToGameRoom.attack, data.gameId, dataForRandomAttack);
							responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
						}
					}
				} else {
					if (data.indexPlayer === currentGame.currentPlayer && typeof currentGame.currentPlayer === "number") {
						if (
							currentGame[currentGame.currentPlayer].logShots.findIndex(
								(item) => item.x === data.x && item.y === data.y,
							) === -1
						) {
							currentGame[currentGame.currentPlayer].logShots.push({ x: data.x, y: data.y });
							responseToGameRoom(typesResponseToGameRoom.attack, data.gameId, data);
							responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
						} else {
							const dataResponse = { currentPlayer: currentGame.currentPlayer };
							const response = { type: typesResponseToGameRoom.turn, data: JSON.stringify(dataResponse), id: 0 };
							const currentPlayerID = currentGame.currentRoom.roomUsers[currentGame.currentPlayer].userId;
							if (currentPlayerID) {
								currentPlayerID.send(JSON.stringify(response));
							}
						}
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
		case "single_play":
			// eslint-disable-next-line no-case-declarations
			const currentUserSingle = userDb.find((user) => user.userId === ws);
			if (currentUserSingle) {
				const currentRoom = createRoom({ userId: ws, name: currentUserSingle?.name });
				addUsersToRoom(currentRoom.roomId, "bot", "bot");
				const randomBotShipsIndex = Math.floor(Math.random() * 4);

				const currentIdGame = createGame(currentRoom);
				addShips({ gameId: currentIdGame, ships: bot_ships[randomBotShipsIndex], indexPlayer: 1 });
				//

				responseToGameRoom(typesResponseToGameRoom.create_game, currentIdGame);
				responseToGameRoom(typesResponseToGameRoom.start_game, currentIdGame);
				responseToGameRoom(typesResponseToGameRoom.turn, data.gameId);
			}

			return;
		}
	} else {
		wss.clients.forEach((client) => {
			client.send("error");
		});
	}
};
export const getRandomAttackData = (gameId: number) =>{
	const currentGame = gameDb.find((game) => game.idGame == gameId);
	let position = { x: 0, y: 0 };
	if (currentGame){
		const currentPlayer = currentGame.currentPlayer;
		if(typeof currentPlayer === "number"){
			const logShots = currentGame[currentPlayer].logShots;
			
			let isFalse = true;
			while(isFalse){
				 position = getRandomCoordinates();
				const samePosition = logShots.find(shot => shot.x === position.x && shot.y === position.y );
				if(!samePosition){ isFalse = false;}
			}
		}
	}
	return position; 
};
const getRandomCoordinates = () => {
	const x = Math.floor(Math.random() * 10);
	const y = Math.floor(Math.random() * 10);
	return {x: x, y: y};
};