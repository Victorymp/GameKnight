import { type GameData} from "../../models/model";
import { createGame as apiCreateGame } from "../../api/api-controller";

class GameController {
	private static instance: GameController | null = null;
	private gameData?: GameData;

	private constructor() {}

	static getInstance(): GameController {
		if (!GameController.instance) {
			GameController.instance = new GameController();
		}
		return GameController.instance;
	}

	async createGame(gameCode?: string, data?: Partial<GameData>): Promise<GameData | undefined> {
		if (this.gameData) return this.gameData;

		try {
			const created = await apiCreateGame(gameCode);
			console.log("apiCreateGame response:", created);
			this.gameData = created;
			return this.gameData;
		} catch (err) {
			// API failed - fall back to provided data or an empty stub
			if (data) {
				this.gameData = { ...(data as GameData) } as GameData;
			} else {
				this.gameData = { gameQrB64: "", gameCode: gameCode } as GameData;
			}
			return this.gameData;
		}
	}

	getGame(): GameData | undefined {
		return this.gameData;
	}

	reset(): void {
		this.gameData = undefined;
	}
}

const gameController = GameController.getInstance();
export default gameController;