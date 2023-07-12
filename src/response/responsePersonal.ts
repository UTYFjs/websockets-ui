import { WebSocket } from "ws";
import { userDb } from "../db/db";

export const responsePersonal = (ws: WebSocket, isError?: boolean) => {
	const user = userDb.find((user)=> user.userId === ws);
	if (isError) {
		if (user) {
			const dataResponse = {
				name: user.name,
				index: 1,
				error: true,
				errorText: "Invalid Password",
			};
			const response = { type: "reg", data: JSON.stringify(dataResponse), id: 0 };
			ws.send(JSON.stringify(response));
		}
	} else {
		if (user) {
			const dataResponse = {
				name: user.name,
				index: userDb.findIndex((user) => user.userId === ws),
				error: false,
				errorText: "noError",
			};
			const response = { type: "reg", data: JSON.stringify(dataResponse), id: 0 };
			ws.send(JSON.stringify(response));
		}
	}
};