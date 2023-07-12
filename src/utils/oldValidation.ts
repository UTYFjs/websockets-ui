import { WsResponse } from "../types/types";

interface RegMessageData {
  name: string;
  password: string;
}

interface OtherMessageData {
  [key: string]: any;
}
type MessageData = RegMessageData | OtherMessageData;

export const validation = (message: WsResponse) => {
	let data;
	if (message.data) {
		data = JSON.parse(message.data);
	}

	switch (message.type) {
	case "reg":
		if (!data.name || data.name.length < 5 || !data.password || data.password.length < 5) {
			return null;
		}
		return data;
	default:
		if (!data) {
			data = 1;
		}
		return data;
	}
};
