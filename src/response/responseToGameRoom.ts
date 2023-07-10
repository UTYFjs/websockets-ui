import { typesResponseToGameRoom } from "../const/constants";
import { gameDb, winnersDb } from "../db/db";
import { RoomType } from "../types/types";
import { wss } from "../websocket_server";

export const responseToGameRoom = (
	type: typesResponseToGameRoom,
	currentIdGame: number,
	dataAttack?: { x: number; y: number; gameId: number; indexPlayer: number },
) => {
	let dataResponse;
	const response = { type: type, data: JSON.stringify(dataResponse), id: 0 };
	if (type === typesResponseToGameRoom.create_game) {
		const currentGame = gameDb.find((game) => game.idGame === currentIdGame);
		if(currentGame){
			currentGame.currentRoom.roomUsers.forEach((user) => {
				dataResponse = { idGame: currentIdGame, idPlayer: user.index };
				response.data = JSON.stringify(dataResponse);
				user.userId.send(JSON.stringify(response));
			});
		}

		return;
	}
	if (type === typesResponseToGameRoom.start_game) {
		const currentGame = gameDb.find((game) => game.idGame === currentIdGame);
		if (currentGame && currentGame[0].ships.length > 0 && currentGame[1].ships.length > 0) {
			currentGame.currentRoom.roomUsers.forEach((user) => {
				//console.log("ships position ", ` user ${currentGame[user.index]}`, currentGame[user.index]);
				dataResponse = { ships: currentGame[user.index], currentPlayerIndex: user.index };
				response.data = JSON.stringify(dataResponse);
				user.userId.send(JSON.stringify(response));
			});
		}

		return;
	}
	if (type === typesResponseToGameRoom.turn) {
		const currentGame = gameDb.find((game) => game.idGame === currentIdGame);
		if (currentGame && currentGame[0].ships.length > 0 && currentGame[1].ships.length > 0) {
			if (typeof currentGame.currentPlayer === "undefined") {
				currentGame.currentPlayer = 0;
			}
			console.log("current player из турн", currentGame.currentPlayer);
			currentGame.currentRoom.roomUsers.forEach((user) => {
				dataResponse = { currentPlayer: currentGame.currentPlayer };
				response.data = JSON.stringify(dataResponse);
				user.userId.send(JSON.stringify(response));
			});
		}
		return;
	}
	if (type === typesResponseToGameRoom.attack && dataAttack) {
		const currentGame = gameDb.find((game) => game.idGame === currentIdGame);
		if (currentGame && currentGame[0].ships.length > 0 && currentGame[1].ships.length > 0) {
			//console.log("координаты корабля из атаки", currentGame[0].shipsXY);
			const{ x,y } = dataAttack;
			const status = checkStatusAttack(dataAttack);
			if(status === "killed"){
				
				const dataResponse = { position: { x: x, y: y }, currentPlayer: currentGame.currentPlayer, status: "killed" };
				currentGame.currentRoom.roomUsers.forEach((user) => {
					response.data = JSON.stringify(dataResponse);
					user.userId.send(JSON.stringify(response));
				});
			} else {
				const dataResponse = { position: { x: x, y: y }, currentPlayer: currentGame.currentPlayer, status: status };
				currentGame.currentRoom.roomUsers.forEach((user) => {
					response.data = JSON.stringify(dataResponse);
					user.userId.send(JSON.stringify(response));
				});
				if (dataResponse.status === "miss") {
					currentGame.currentPlayer = currentGame.currentPlayer ? 0 : 1;
				} else {
					currentGame.currentPlayer = currentGame.currentPlayer ? 1 : 0;
				}
			}
		}

		return;
	}
};

const checkStatusAttack = (dataAttack: { x: number; y: number; gameId: number; indexPlayer: number }) => {
	const {x, y, gameId, indexPlayer} = dataAttack;

	const currentGame = gameDb.find(game => game.idGame === gameId);
	if (currentGame){
		const indexEnemies = indexPlayer ? 0 : 1;
		if(currentGame[indexEnemies].field[y][x]){
			const indexShip = currentGame[indexEnemies].field[y][x]-1;
			
			//const XYShip = ;
			const indexXY = currentGame[indexEnemies].shipsXY[indexShip].XY.findIndex((xy) => {
				
				return xy.x === x && xy.y === y;
			});
			
			currentGame[indexEnemies].shipsXY[indexShip].killedXY.push(currentGame[indexEnemies].shipsXY[indexShip].XY[indexXY]);
			currentGame[indexEnemies].shipsXY[indexShip].XY.splice(indexXY,1);
			console.log("корабль ", indexShip, currentGame[indexEnemies].shipsXY[indexShip], `координата х ${x} y ${y}`);
			console.log("корабль с поля и его  индекс", currentGame[indexEnemies].field[y][x], indexShip, indexXY.toString());
			if (currentGame[indexEnemies].shipsXY[indexShip].XY.length === 0 && typeof currentGame.currentPlayer === "number") {
				const response = { type: typesResponseToGameRoom.attack, data: "", id: 0 };
				currentGame.currentRoom.roomUsers.forEach((user) => {
					currentGame[indexEnemies].shipsXY[indexShip].aroundShips.forEach((aroundXY) => {
						if (typeof currentGame.currentPlayer === "number")
							currentGame[currentGame.currentPlayer].logShots.push({ x: aroundXY.x, y: aroundXY.y });
						const dataResponse = {
							position: { x: aroundXY.x, y: aroundXY.y },
							currentPlayer: currentGame.currentPlayer,
							status: "miss",
						};
						response.type = typesResponseToGameRoom.attack;
						response.data = JSON.stringify(dataResponse);
						user.userId.send(JSON.stringify(response));
						response.type = typesResponseToGameRoom.turn;
						response.data = JSON.stringify({ currentPlayer: currentGame.currentPlayer });
						user.userId.send(JSON.stringify(response));
					});
					currentGame[indexEnemies].shipsXY[indexShip].killedXY.forEach((killedXY) => {
						const dataResponse = {
							position: { x: killedXY.x, y: killedXY.y },
							currentPlayer: currentGame.currentPlayer,
							status: "killed",
						};
						response.type = typesResponseToGameRoom.attack;
						response.data = JSON.stringify(dataResponse);
						user.userId.send(JSON.stringify(response));
						response.type = typesResponseToGameRoom.turn;
						response.data = JSON.stringify({ currentPlayer: currentGame.currentPlayer });
						user.userId.send(JSON.stringify(response));
					});
				});
				//const indexKilledShip = currentGame[indexEnemies].shipsXY.findIndex(item => item === currentGame[indexEnemies].shipsXY[indexShip]);
				//console.log("indexKilledShip", indexKilledShip);
				const restShipCells = currentGame[indexEnemies].shipsXY.reduce((acc, item) => {
					return acc + item.XY.length;
				}, 0);
				console.log("restShipCells", restShipCells);


				if (restShipCells === 0) {
					//add winners to Db
					if (currentGame && typeof currentGame.currentPlayer === "number") {
						const winner = winnersDb.find(
							(winner) =>
								winner.name === currentGame.currentRoom.roomUsers[currentGame.currentPlayer as unknown as 0 | 1].name,
						);
						if (winner) {
							winner.wins += 1;
						} else {
							winnersDb.push({
								name: currentGame.currentRoom.roomUsers[currentGame.currentPlayer as unknown as 0 | 1].name,
								wins: 1,
							});
						}
					}
					currentGame.currentRoom.roomUsers.forEach((user) => {
						//send resp finish
						const dataResponse = {
							winPlayer: currentGame.currentPlayer,
						};
						response.type = typesResponseToGameRoom.finish;
						response.data = JSON.stringify(dataResponse);
						user.userId.send(JSON.stringify(response));
						// send all update winners
						const responseAll = { type: "update_winners", data: JSON.stringify(winnersDb), id: 0 };
						wss.clients.forEach((client) => {
							client.send(JSON.stringify(responseAll));
						});
					});
				}
				//console.log("lengrh killedship", currentGame[indexEnemies].shipsXY.length);
				return "killed";
			} 
			return "shot";
		}
		return "miss";
	}
};