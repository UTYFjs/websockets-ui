import { WebSocket } from "ws";
import { CoordinatsType, GameType, RoomType, ShipType, UserType, WinnersType } from "../types/types";

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
	gameDb.push({
		idGame: idGame,
		currentPlayer: undefined,
		currentRoom: currentRoom,
		0: { ships: [], field: [], logShots: [], shipsXY: [{ XY: [], aroundShips: [], killedXY: [] }] },
		1: { ships: [], field: [], logShots: [], shipsXY: [{ XY: [], aroundShips: [], killedXY: [] }] },
	});
	return idGame; 
};

export const addShips = (data: {gameId: number, ships: Array<ShipType>, indexPlayer: 0 | 1 }) => {
	const currentGame = gameDb.find((game) => game.idGame === data.gameId);
	if(currentGame){
		currentGame[data.indexPlayer].ships = data.ships;
		currentGame[data.indexPlayer].field = getShipsOnField(data);
		//console.log(currentGame[data.indexPlayer].field);
  	}


	return;
};


const getShipsOnField = (data: { gameId: number; ships: Array<ShipType>; indexPlayer: 0 | 1 }) => {
	const {ships, gameId, indexPlayer} = data;
	const field = getEmptyField();
	const currentGame = gameDb.find(game => game.idGame === gameId);
	console.log("getShipsOnField");
	if(currentGame){
		console.log("getShipsOnField заходим в текущую игру");
		console.log("before", currentGame[indexPlayer].shipsXY);
		currentGame[indexPlayer].shipsXY.splice(0,1);
		console.log("after", currentGame[indexPlayer].shipsXY);
		ships.forEach((ship, index) => {
			const shipCoordinates = getShipCoordinates(ship);
			//console.log("координаты корабля", shipCoordinates);
			const coordinatesAroundShip = getCoordinatesAroundShip(shipCoordinates);
			currentGame[indexPlayer].shipsXY.push({XY: shipCoordinates, aroundShips:coordinatesAroundShip,killedXY:[]});
			//console.log("координаты корабля и все что добавляется в XY", currentGame[indexPlayer].shipsXY);
			shipCoordinates.forEach(({ x, y }) => {
				field[y][x] = index + 1;
			});
		});
		console.log();
	}
	
	return field;
};
const getEmptyField = () => {
	const field = [];
	for(let i=0; i<10; i++){
		const a = new Array(10).fill(0);
		field.push(a);
	}
	return field;
};

const getShipCoordinates = (ship: ShipType) => {
	const { position, direction, length } = ship;
	const shipCoordinates = [];
	// сделать ве точки координаты корабля
	shipCoordinates.push(position);
	let restLength = length - 1;
	let count = 1;
	while (restLength > 0) {
		if (direction) {
			shipCoordinates.push({ x: position.x, y: position.y + count });
			count += 1;
			restLength -= 1;
		} else{
			shipCoordinates.push({ x: position.x+count, y: position.y  });
			count += 1;
			restLength -= 1;
		}
	}
	//console.log(`shipcoordinates ${length}`, shipCoordinates);
	return shipCoordinates;
};

const getCoordinatesAroundShip = (shipCoordinates: Array<CoordinatsType>) => {
	
	const coordinatesSet: Set<string> = new Set();
	const offsets = [
		{ x: 0, y: 1 },
		{ x: 0, y: -1 },
		{ x: 1, y: 0 },
		{ x: -1, y: 0 },
		{ x: 1, y: 1 },
		{ x: -1, y: -1 },
		{ x: 1, y: -1 },
		{ x: -1, y: 1 },
	];
	shipCoordinates.forEach((coord) => {
		offsets.forEach((offset) => {
			const around = { x: coord.x + offset.x, y: coord.y + offset.y };
			if (around.x >= 0 && around.y >= 0 && around.x < 10 && around.y <10) {
				coordinatesSet.add(JSON.stringify(around));
			}
		});
	});
	const coordinatesAroundShip: Array<string> = Array.from(coordinatesSet);
	const result:Array<CoordinatsType>=[];
	 coordinatesAroundShip.forEach((coord) => {result.push(JSON.parse(coord));});
	//console.log(coordinatesAroundShip);
	return result;
};