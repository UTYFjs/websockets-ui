import { WsResponse } from "../types/types";

export const validation = (message: WsResponse) =>{
	//console.log("message.data", message.data);
	let data;
	if(message.data){
		data = JSON.parse(message.data);
	}
	
	switch(message.type ){
	case "reg":
		if(!data.name  || data.name.length <5 || !data.password){
			return null;
		}
		return data;
	default:
		if(!data){data = 1;}
		return data;
	}
  
};