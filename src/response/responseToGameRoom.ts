import { typesResponseToGameRoom } from "../const/constants";
import { gameDb } from "../db/db";
import { RoomType } from "../types/types";

export const responseToGameRoom = (type: typesResponseToGameRoom, currentIdGame: number, currentRoom?: RoomType) => {
	let dataResponse;
	const response = { type: type, data: JSON.stringify(dataResponse), id: 0 };
	if (type === typesResponseToGameRoom.create_game && currentRoom) {
		currentRoom.roomUsers.forEach((user) => {
			dataResponse = { idGame: currentIdGame, idPlayer: user.index };
			response.data = JSON.stringify(dataResponse);
			user.userId.send(JSON.stringify(response));
		});
		return;
	}
	if (type === typesResponseToGameRoom.start_game) {
		const currentGame = gameDb.find((game) => game.idGame === currentIdGame);
		if (currentGame && currentGame[0].length > 0 && currentGame[1].length > 0) {
			currentGame.currentRoom.roomUsers.forEach((user) => {
				console.log("ships position ", ` user ${currentGame[user.index]}`, currentGame[user.index]);
				dataResponse = { ships: currentGame[user.index], currentPlayerIndex: user.index };
				response.data = JSON.stringify(dataResponse);
				user.userId.send(JSON.stringify(response));
			});
		}

		return;
	}
	if (type === typesResponseToGameRoom.turn) {
		const currentGame = gameDb.find((game) => game.idGame === currentIdGame);
		if (currentGame && currentGame[0].length > 0 && currentGame[1].length > 0) {
			if (typeof currentGame.currentPlayer === "undefined"){currentGame.currentPlayer = 0;}
			console.log("current player из турн", currentGame.currentPlayer);
			currentGame.currentRoom.roomUsers.forEach((user) => {
				dataResponse = { currentPlayer: currentGame.currentPlayer };
				response.data = JSON.stringify(dataResponse);
				user.userId.send(JSON.stringify(response));
			});
		}
		return;
	}
	if (type === typesResponseToGameRoom.attack) {
		const currentGame = gameDb.find((game) => game.idGame === currentIdGame);
		if (currentGame && currentGame[0].length > 0 && currentGame[1].length > 0) {
			const dataResponse = { position: { x: 0, y: 0 }, currentPlayer: currentGame.currentPlayer, status: "miss" };
			currentGame.currentRoom.roomUsers.forEach((user) => {
				response.data = JSON.stringify(dataResponse);
				user.userId.send(JSON.stringify(response));
			});
			if (dataResponse.status === "miss") {
				console.log(
					"меняем каррент плаер респонс статус",
					dataResponse.status,
					"current player",
					currentGame.currentPlayer,
				);
				currentGame.currentPlayer = currentGame.currentPlayer ? 0 : 1;
				console.log("current player после изменения", currentGame.currentPlayer);
			} else {
				currentGame.currentPlayer = currentGame.currentPlayer ? 1 : 0;
				console.log("не меняем каррент плаер респонс статус", dataResponse.status);
			}
		}
		return;
	}
};