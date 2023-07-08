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
  userId: WebSocket
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
  currentRoom: RoomType;
  0:  Array<ShipType>;
  1:  Array<ShipType>;
};
export type ShipType = {
  position: { X: number; y: number};
  direction: boolean;
  type: "huge" | "large" | "medium" | "small";
  length: number
}