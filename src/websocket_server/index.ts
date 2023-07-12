import  { WebSocketServer } from "ws";
import { WsResponse } from "../types/types";
import {  gameDb, roomDb, userDb, winnersDb } from "../db/db";
import { responseAll } from "../response/responseAll";
import { typesResponseToGameRoom } from "../const/constants";
import {  handle } from "./handle";


export const wss = new WebSocketServer({port: 3000});

wss.on("connection", function connection(ws) {
	console.log("there are connection websocket");
	// ws - одно подключение
	ws.on("error", console.error);

	ws.on("message", function message(message) {
		const message1 = JSON.parse(message.toString());
		if(message1.data){
			const data1 = JSON.parse(message1.data);
		} 		
		handle(message1 as unknown as WsResponse, ws, wss );
	});

	ws.on("close", () => {
		
		const room = roomDb.find(room => room.roomUsers.find((user) => {
			return user.userId === ws;}));
		if(room) {
			console.log("Client disconnected");
			const i = room.roomUsers.find((user) => user.userId === ws);
			const enemy = room.roomUsers.find((user) => user.userId !== ws);
			// add winners to winnerTable
			if (enemy) {
				console.log("Enemy Client disconnected");
				const winnerIndexPlayer = room.roomUsers.findIndex((user) => (user.userId = enemy.userId));
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
				const response = {
					type: typesResponseToGameRoom.finish,
					data: JSON.stringify({ winPlayer: winnerIndexPlayer }),
					id: 0,
				};
				if (enemy.userId && i?.userId) {
					enemy.userId.send(JSON.stringify(response));
					i?.userId.send(JSON.stringify(response));
				}
			}

			//delete rooms
			const currentGameIndex = gameDb.findIndex((game) => game.currentRoom.roomId === room.roomId);
			const roomIndex = roomDb.findIndex((room1) =>	room1.roomId === room.roomId);
			roomDb.splice(roomIndex, 1);
			gameDb.splice(currentGameIndex, 1);
			
			// send all update winners and rooms
			responseAll("update_winners");
			responseAll("update_room");
		}
		console.log("Client disconnected");
	});
	//wss.clients Arr - все клиенты у кого установлено подключение 
});
