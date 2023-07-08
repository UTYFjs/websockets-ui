import { WebSocket } from "ws";
import { userDb } from "../db/db";

export const responsePersonal = (ws: WebSocket) => {
	const user = userDb.find((user)=> user.userId === ws);
	if(user){
		const dataResponse = {
			name: user.name,
			index: userDb.findIndex((user) => user.userId === ws),
			error: false,
			errorText: "noError",
		};
		const response = { type: "reg", data: JSON.stringify(dataResponse), id: 0 };
		ws.send(JSON.stringify(response));
	}
	
	
};
