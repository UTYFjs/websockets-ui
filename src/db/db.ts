import { WebSocket } from "ws";
import { GameType, RoomType, ShipType, UserType, WinnersType } from "../types/types";

export const userDb: Array<UserType> = [];

export const roomDb: Array<RoomType> =[];

export const winnersDb: Array<WinnersType> = [{name: "alex", wins: 16}];

export const gameDb: Array<GameType> = [];

export const createRoom = (data: Omit<UserType,"password">) => {
	const currentRoom: RoomType = {
		roomId: roomDb.length + 1,
		roomUsers: [{ userId: data.userId, name: data.name, index: 0 }],
	};
	roomDb.push(currentRoom);
	//return currentRoom;
};
export const addUsersToRoom = (indexRoom: number, userId: WebSocket, name: string) =>{
	const currentRoom = roomDb.find((room) => room.roomId === indexRoom);
	if(currentRoom){
		currentRoom.roomUsers.push({ userId: userId, name: name, index: 1 });
		return {name:name, index:1};
	}
};

export const createGame = ( currentRoom: RoomType): number => {
	const idGame = gameDb.length + 1;
	gameDb.push({ idGame: idGame,currentPlayer: undefined, currentRoom: currentRoom , 0: [], 1: [] });
	return idGame; 
};

export const addShips = (data: {gameId: number, ships: Array<ShipType>, indexPlayer: 0 | 1 }) => {
	const currentGame = gameDb.find((game) => game.idGame === data.gameId);
	if(currentGame){
		currentGame[data.indexPlayer] = data.ships;
  	}


	return;
};