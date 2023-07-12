import { userDb } from "../db/db";
import { ShipType, WsResponse } from "../types/types";

interface RegMessageData {
  name: string;
  password: string;
}
interface AddToRoom {
	indexRoom: number;
}

interface OtherMessageData {
  [key: string]: any;
}
interface RandomAttack{
	gameId: number;
	indexPlayer: number;
}
interface Attack {
	x: number;
	y: number;
	gameId: number;
	indexPlayer: number;
}
type MessageData = RegMessageData | OtherMessageData | AddToRoom | Array<ShipType> | RandomAttack | Attack;


export const validation = (message: WsResponse): MessageData | object | null | undefined => {
	let data: MessageData | "" |undefined;
	if (message.data) {
		data = JSON.parse(message.data) as MessageData;
		let currentUser;
		switch (message.type) {
		case "reg":
			if ("name" in data && "password" in data && data.name.length > 5 && data.password.length > 5) {
				const newData = data as RegMessageData;
				currentUser = userDb.find((user) => user.name === newData.name);
				if(currentUser){
					const currentPassword = userDb.find((user) => user.password === newData.password);
					if (currentPassword){
						const result = "hello user";
					}else{ const result = "wrong password";}
				}
				return newData;
			} else {
				//toDo response to frontend incorrect data
				return null;
			}
		

		default:
			if (!data) {
				data = {} as OtherMessageData;
			}
			return data;
		}
	}
};
