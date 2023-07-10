import { gameDb } from "../db/db";

export const getRandomAttackData = (gameId: number) =>{
	const currentGame = gameDb.find((game) => game.idGame == gameId);
	let position = { x: 0, y: 0 };
	if (currentGame){
		const currentPlayer = currentGame.currentPlayer;
		if(typeof currentPlayer === "number"){
			const logShots = currentGame[currentPlayer].logShots;
			
			let isFalse = true;
			while(isFalse){
				 position = getRandomCoordinates();
				const samePosition = logShots.find(shot => shot.x === position.x && shot.y === position.y );
				if(!samePosition){ isFalse = false;}
			}
		}
	}
	return position; 
};
const getRandomCoordinates = () => {
	const x = Math.floor(Math.random() * 10);
	const y = Math.floor(Math.random() * 10);
	return {x: x, y: y};
};