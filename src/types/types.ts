import WebSocket from "ws";

export interface WsResponse {
  type: string;
  data: string/*Record<string, number | boolean> | string*/;
  id: number
}
export type UserType = {
  userId: WebSocket;
  name: string;
  password: string;
};

export type RoomType = {
  roomId: number;
  roomUsers: Array<PlayerType>;
};
type PlayerType = {
  userId: WebSocket | null;
  name: string;
  index: 0 | 1;
};

export type ResponseType = {
  type: string; 
  data: string; 
  id: number;
}

export type WinnersType = {
  name:string;
  wins: number
}

export type GameType = {
  idGame: number;
  currentPlayer: 0 | 1 | undefined;
  currentRoom: RoomType;
  0: {
    ships: Array<ShipType>;
    field: Array<Array<number>>;
    logShots: Array<CoordinatsType>;
    shipsXY: [{ XY: Array<CoordinatsType>; aroundShips: Array<CoordinatsType>; killedXY: Array<CoordinatsType> }];
  };
  1: {
    ships: Array<ShipType>;
    field: Array<Array<number>>;
    logShots: Array<CoordinatsType>;
    shipsXY: [{ XY: Array<CoordinatsType>; aroundShips: Array<CoordinatsType>; killedXY: Array<CoordinatsType> }];
  };
};
export type ShipType = {
  position: { x: number; y: number};
  direction: boolean;
  type: "huge" | "large" | "medium" | "small";
  length: number
}
export type CoordinatsType = {
  x: number;
  y: number
}