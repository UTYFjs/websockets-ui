import { roomDb } from "../db/db";
import { wss } from "../websocket_server";

export const responseAll = (type: "update_room" | "update_winners") => {

	if (type === "update_room"){
		const dataResponse = roomDb
			.filter((room) => {
				if (room.roomUsers.length === 1) {
					return true;
				}
			})
			.map((room) => {
				return {
					roomId: room.roomId,
					roomUsers: [{ name: room.roomUsers[0].name, index: room.roomUsers[0].index }],
				};
			});
		const response = { type: "update_room", data: JSON.stringify(dataResponse), id: 0 };
		wss.clients.forEach((client) => {
			client.send(JSON.stringify(response));
		});
	}
	
};